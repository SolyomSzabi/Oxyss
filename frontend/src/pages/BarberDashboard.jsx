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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  RefreshCw,
  Users,
  LogOut,
  Plus,
  Coffee,
  Trash2,
  Edit2,
  Save,
  X
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
  const [editingDuration, setEditingDuration] = useState({});
  const [newDurations, setNewDurations] = useState({});
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [breakForm, setBreakForm] = useState({
    break_date: '',
    start_time: '',
    end_time: '',
    title: 'Break'
  });
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && barberData) {
      fetchData();
    }
  }, [isAuthenticated, barberData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/barber-login');
    }
  }, [isAuthenticated, loading, navigate]);

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
      const url = `${API}/barbers/${barberData.id}/appointments`;
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

  const handleEditDuration = (appointmentId, currentDuration) => {
    setEditingDuration({ ...editingDuration, [appointmentId]: true });
    setNewDurations({ ...newDurations, [appointmentId]: currentDuration });
  };

  const handleCancelEditDuration = (appointmentId) => {
    setEditingDuration({ ...editingDuration, [appointmentId]: false });
    setNewDurations({ ...newDurations, [appointmentId]: undefined });
  };

  const handleSaveDuration = async (appointmentId, originalDuration) => {
    const newDuration = newDurations[appointmentId];
    
    if (!newDuration || newDuration < 15) {
      toast.error('Duration must be at least 15 minutes');
      return;
    }

    if (newDuration > originalDuration) {
      toast.error('You can only reduce the duration, not increase it');
      return;
    }

    try {
      setUpdating({ ...updating, [appointmentId]: true });
      
      await axios.patch(
        `${API}/appointments/${appointmentId}/duration`,
        { duration: parseInt(newDuration) },
        getAuthHeaders()
      );

      toast.success(`Duration updated to ${newDuration} minutes`);
      setEditingDuration({ ...editingDuration, [appointmentId]: false });
      
      // Refresh appointments
      await fetchTodayAppointments();
      await fetchBarberAppointments();
    } catch (error) {
      console.error('Error updating duration:', error);
      toast.error(error.response?.data?.detail || 'Failed to update duration');
    } finally {
      setUpdating({ ...updating, [appointmentId]: false });
    }
  };

  const handleDurationChange = (appointmentId, value) => {
    setNewDurations({ ...newDurations, [appointmentId]: value });
  };

    const handleDeleteClick = (appointment) => {
    setDeletingAppointment(appointment);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingAppointment(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAppointment) return;
    
    try {
      setDeleting(true);
      
      await axios.delete(
        `${API}/appointments/${deletingAppointment.id}`,
        getAuthHeaders()
      );

      toast.success('Appointment deleted successfully');
      handleCloseDeleteDialog();
      
      // Refresh appointments
      await fetchTodayAppointments();
      await fetchBarberAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete appointment');
    } finally {
      setDeleting(false);
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
          
          {/* Duration Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700">Duration</span>
              {appointment.status === 'confirmed' && !editingDuration[appointment.id] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditDuration(appointment.id, appointment.duration)}
                  className="h-6 px-2"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            {editingDuration[appointment.id] ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="15"
                  max={appointment.duration}
                  step="15"
                  value={newDurations[appointment.id] || appointment.duration}
                  onChange={(e) => handleDurationChange(appointment.id, e.target.value)}
                  className="w-20 h-8 text-sm"
                />
                <span className="text-xs text-zinc-600">min</span>
                <Button
                  size="sm"
                  onClick={() => handleSaveDuration(appointment.id, appointment.duration)}
                  disabled={updating[appointment.id]}
                  className="h-6 px-2 bg-green-600 hover:bg-green-700"
                >
                  {updating[appointment.id] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelEditDuration(appointment.id)}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-zinc-50">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.duration || 'N/A'} min
                </Badge>
              </div>
            )}
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
        <div>
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
          <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleDeleteClick(appointment)}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid={`delete-btn-${appointment.id}`}
          >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
          </Button>
        </div>
        )}

        {appointment.status !== 'confirmed' && (
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDeleteClick(appointment)}
              className="border-red-300 text-red-600 hover:bg-red-50"
              data-testid={`delete-btn-${appointment.id}`}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete Appointment
            </Button>
          </div>
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

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
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
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/all-appointments')}
                className="text-zinc-600 hover:text-zinc-900"
              >
                <Users className="h-4 w-4 mr-2" />
                All Staff Schedule
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-zinc-600 hover:text-zinc-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today" data-testid="today-tab">Today's Schedule</TabsTrigger>
              <TabsTrigger value="appointments" data-testid="appointments-tab">All Appointments</TabsTrigger>
              <TabsTrigger value="breaks" data-testid="breaks-tab">Manage Breaks</TabsTrigger>
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

            {/* Filters tab removed for simplicity */}
          </Tabs>
        </div>
      </section>

          {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingAppointment} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-2 pb-4 border-b border-zinc-200">
            <DialogTitle className="text-xl font-bold text-zinc-900">Delete Appointment</DialogTitle>
            <DialogDescription className="text-sm text-zinc-600">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {deletingAppointment && (
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-lg space-y-2 text-sm border border-red-200">
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Customer:</span> {deletingAppointment.customer_name}</div>
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Service:</span> {deletingAppointment.service_name}</div>
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Date:</span> {formatAppointmentDate(deletingAppointment.appointment_date)}</div>
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Time:</span> {deletingAppointment.appointment_time?.slice(0, 5)}</div>
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Duration:</span> {deletingAppointment.duration} minutes</div>
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Phone:</span> {deletingAppointment.customer_phone}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteDialog}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarberDashboard;