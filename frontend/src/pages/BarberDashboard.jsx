import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2,
  Filter,
  RefreshCw,
  Users,
  LogOut,
  Plus,
  Coffee,
  Trash2
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BarberDashboard = () => {
  const { isAuthenticated, barberData, logout } = useAuth();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [breakForm, setBreakForm] = useState({
    break_date: '',
    start_time: '',
    end_time: '',
    title: 'Break'
  });

  // Handle authentication and data fetching
  useEffect(() => {
    if (isAuthenticated && barberData) {
      fetchData();
    } else if (!isAuthenticated && !loading) {
      navigate('/barber-login');
    }
  }, [isAuthenticated, barberData, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && barberData) {
      fetchBarberAppointments();
    }
  }, [filters, isAuthenticated, barberData]);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${barberData?.token}`
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTodayAppointments(),
        fetchBarberAppointments(),
        fetchBarberBreaks()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/today`);
      // Filter for current barber's appointments
      const myAppointments = response.data.filter(apt => apt.barber_id === barberData.id);
      setTodayAppointments(myAppointments);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    }
  };

  const fetchBarberAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const url = `${API}/barbers/${barberData.id}/appointments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching barber appointments:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/barber-login');
      } else {
        toast.error('Failed to load appointments');
      }
    }
  };

  const fetchBarberBreaks = async () => {
    try {
      const response = await axios.get(`${API}/barbers/${barberData.id}/breaks`, getAuthHeaders());
      setBreaks(response.data);
    } catch (error) {
      console.error('Error fetching barber breaks:', error);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    setUpdating(prev => ({ ...prev, [appointmentId]: true }));
    try {
      await axios.patch(`${API}/appointments/${appointmentId}`, {
        status: newStatus
      }, getAuthHeaders());
      
      toast.success(`Appointment ${newStatus} successfully`);
      
      // Refresh appointments
      await fetchBarberAppointments();
      await fetchTodayAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setUpdating(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const handleBreakSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/breaks`, {
        ...breakForm,
        barber_id: barberData.id
      }, getAuthHeaders());
      
      toast.success('Break added successfully');
      setShowBreakForm(false);
      setBreakForm({
        break_date: '',
        start_time: '',
        end_time: '',
        title: 'Break'
      });
      await fetchBarberBreaks();
    } catch (error) {
      console.error('Error creating break:', error);
      toast.error('Failed to create break');
    }
  };

  const handleDeleteBreak = async (breakId) => {
    if (!window.confirm('Are you sure you want to delete this break?')) return;
    
    try {
      await axios.delete(`${API}/breaks/${breakId}`, getAuthHeaders());
      toast.success('Break deleted successfully');
      await fetchBarberBreaks();
    } catch (error) {
      console.error('Error deleting break:', error);
      toast.error('Failed to delete break');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/barber-login');
    toast.success('Logged out successfully');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatAppointmentDate = (dateStr) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const AppointmentCard = ({ appointment, showBarberName = false }) => (
    <Card key={appointment.id} className="mb-4" data-testid={`appointment-card-${appointment.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon(appointment.status)}
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
            {showBarberName && (
              <Badge variant="outline">{appointment.barber_name}</Badge>
            )}
          </div>
          <div className="text-right text-sm text-zinc-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatAppointmentDate(appointment.appointment_date)}
            </div>
            <div className="flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {appointment.appointment_time.slice(0, 5)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-zinc-900 mb-2">{appointment.service_name}</h3>
            <div className="space-y-1 text-sm text-zinc-600">
              <div className="flex items-center">
                <User className="h-3 w-3 mr-2" />
                {appointment.customer_name}
              </div>
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-2" />
                {appointment.customer_phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-3 w-3 mr-2" />
                {appointment.customer_email}
              </div>
            </div>
          </div>
        </div>

        {appointment.status === 'pending' && (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
              disabled={updating[appointment.id]}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid={`confirm-btn-${appointment.id}`}
            >
              {updating[appointment.id] ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 mr-1" />
              )}
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
              disabled={updating[appointment.id]}
              data-testid={`cancel-btn-${appointment.id}`}
            >
              {updating[appointment.id] ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Cancel
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <Button 
            size="sm" 
            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
            disabled={updating[appointment.id]}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-testid={`complete-btn-${appointment.id}`}
          >
            {updating[appointment.id] ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <CheckCircle className="h-3 w-3 mr-1" />
            )}
            Mark Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading || !barberData) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-zinc-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
                Welcome, {barberData.name}
              </h1>
              <p className="text-xl text-zinc-600">
                Manage your appointments and schedule
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-zinc-600 hover:text-zinc-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="today" data-testid="today-tab">Today's Schedule</TabsTrigger>
              <TabsTrigger value="appointments" data-testid="appointments-tab">All Appointments</TabsTrigger>
              <TabsTrigger value="breaks" data-testid="breaks-tab">Manage Breaks</TabsTrigger>
              <TabsTrigger value="filters" data-testid="filters-tab">Filters</TabsTrigger>
            </TabsList>

            {/* Today's Appointments */}
            <TabsContent value="today">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Today's Schedule</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={fetchTodayAppointments}
                      data-testid="refresh-today-btn"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500" data-testid="no-today-appointments">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                      <p>No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map(appointment => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment} 
                          showBarberName={true}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Appointments */}
            <TabsContent value="appointments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>My Appointments</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={fetchBarberAppointments}
                      data-testid="refresh-appointments-btn"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500" data-testid="no-appointments">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                      <p>No appointments found for the selected criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Breaks Management */}
            <TabsContent value="breaks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Manage Breaks</span>
                    <Button 
                      onClick={() => setShowBreakForm(true)}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      data-testid="add-break-btn"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Break
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Break Form */}
                  {showBreakForm && (
                    <Card className="mb-6 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="text-lg">Add New Break</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleBreakSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="break_date">Date</Label>
                              <Input
                                type="date"
                                id="break_date"
                                value={breakForm.break_date}
                                onChange={(e) => setBreakForm(prev => ({ ...prev, break_date: e.target.value }))}
                                required
                                data-testid="break-date-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                type="text"
                                id="title"
                                placeholder="Lunch break, Personal time, etc."
                                value={breakForm.title}
                                onChange={(e) => setBreakForm(prev => ({ ...prev, title: e.target.value }))}
                                required
                                data-testid="break-title-input"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="start_time">Start Time</Label>
                              <Input
                                type="time"
                                id="start_time"
                                value={breakForm.start_time}
                                onChange={(e) => setBreakForm(prev => ({ ...prev, start_time: e.target.value }))}
                                required
                                data-testid="break-start-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="end_time">End Time</Label>
                              <Input
                                type="time"
                                id="end_time"
                                value={breakForm.end_time}
                                onChange={(e) => setBreakForm(prev => ({ ...prev, end_time: e.target.value }))}
                                required
                                data-testid="break-end-input"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700" data-testid="save-break-btn">
                              Save Break
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowBreakForm(false)}
                              data-testid="cancel-break-btn"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Current Breaks */}
                  {breaks.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500" data-testid="no-breaks">
                      <Coffee className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                      <p>No breaks scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {breaks.map(breakItem => (
                        <Card key={breakItem.id} className="border-orange-200" data-testid={`break-card-${breakItem.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Coffee className="h-5 w-5 text-orange-600" />
                                <div>
                                  <h4 className="font-semibold text-zinc-900">{breakItem.title}</h4>
                                  <p className="text-sm text-zinc-600">
                                    {formatAppointmentDate(breakItem.break_date)} • {breakItem.start_time.slice(0, 5)} - {breakItem.end_time.slice(0, 5)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBreak(breakItem.id)}
                                data-testid={`delete-break-${breakItem.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Filters */}
            <TabsContent value="filters">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filter Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status-filter">Status</Label>
                      <Select 
                        value={filters.status} 
                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger data-testid="status-filter">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="date-from">Date From</Label>
                      <Input 
                        type="date" 
                        value={filters.dateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        data-testid="date-from-filter"
                      />
                    </div>

                    <div>
                      <Label htmlFor="date-to">Date To</Label>
                      <Input 
                        type="date" 
                        value={filters.dateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        data-testid="date-to-filter"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={fetchBarberAppointments}
                      className="bg-yellow-600 hover:bg-yellow-700"
                      data-testid="apply-filters-btn"
                    >
                      Apply Filters
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setFilters({ status: '', dateFrom: '', dateTo: '' });
                        setTimeout(() => fetchBarberAppointments(), 100);
                      }}
                      data-testid="clear-filters-btn"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default BarberDashboard;