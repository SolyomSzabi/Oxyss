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
  Users
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BarberDashboard = () => {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchBarbers();
    fetchTodayAppointments();
  }, []);

  useEffect(() => {
    if (selectedBarber) {
      fetchBarberAppointments();
    }
  }, [selectedBarber, filters]);

  const fetchBarbers = async () => {
    try {
      const response = await axios.get(`${API}/barbers`);
      setBarbers(response.data);
      if (response.data.length > 0) {
        setSelectedBarber(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments/today`);
      setTodayAppointments(response.data);
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

      const url = `${API}/barbers/${selectedBarber}/appointments${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching barber appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    setUpdating(prev => ({ ...prev, [appointmentId]: true }));
    try {
      await axios.patch(`${API}/appointments/${appointmentId}`, {
        status: newStatus
      });
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-zinc-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedBarberData = barbers.find(b => b.id === selectedBarber);

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-zinc-900 mb-4">
              Barber Dashboard
            </h1>
            <p className="text-xl text-zinc-600">
              Manage your appointments and schedule
            </p>
          </div>

          {/* Barber Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Select Barber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger className="w-full md:w-auto" data-testid="barber-select">
                  <SelectValue placeholder="Choose a barber" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map(barber => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name} - {barber.experience_years}+ years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedBarberData && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={selectedBarberData.image_url} 
                      alt={selectedBarberData.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-zinc-900">{selectedBarberData.name}</h3>
                      <p className="text-sm text-zinc-600 mb-2">{selectedBarberData.description}</p>
                      <div className="flex space-x-2">
                        <Badge variant="outline">{selectedBarberData.experience_years}+ years</Badge>
                        {selectedBarberData.specialties.slice(0, 2).map((specialty, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="today" data-testid="today-tab">Today's Schedule</TabsTrigger>
              <TabsTrigger value="appointments" data-testid="appointments-tab">All Appointments</TabsTrigger>
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
                    <span>
                      {selectedBarberData?.name}'s Appointments
                    </span>
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
                  {!selectedBarber ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
                      <p>Please select a barber to view appointments</p>
                    </div>
                  ) : appointments.length === 0 ? (
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