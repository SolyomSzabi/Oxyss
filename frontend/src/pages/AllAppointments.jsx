import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, Loader2, ArrowLeft, Edit2, Save, X, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AllAppointments = () => {
  const navigate = useNavigate();
  const { barberData } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newDuration, setNewDuration] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
  new Date().toISOString().split("T")[0] // yyyy-mm-dd
  );
  const [creatingAppointment, setCreatingAppointment] = useState(null);
  const [newAppointmentData, setNewAppointmentData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    service_id: '',
    notes: ''
  });
  const [creating, setCreating] = useState(false);
  const [services, setServices] = useState([]);


    // Create 15-minute time slots from 9 AM to 7 PM
  const businessHours = Array.from({ length: 10 }, (_, i) => 9 + i); // Still keep hours for display
  const timeSlots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push({ hour, minute });
    }
  }

  useEffect(() => {
    if (!barberData) {
      navigate('/barber-login');
      return;
    }
    fetchAllAppointments();
    fetchServices(); // Add this line

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [barberData, navigate]);

  useEffect(() => {
  if (barberData) {
    fetchAllAppointments(selectedDate);
  }
}, [selectedDate]);

  const fetchAllAppointments = async (date = selectedDate) => {
    try {
      setLoading(true);
      
      // Fetch all barbers
      const barbersResponse = await axios.get(`${API}/barbers`);
      const allBarbers = barbersResponse.data;

      // Fetch today's appointments for each barber
      const token = localStorage.getItem('barber_token');
    const barbersWithAppointments = await Promise.all(
      allBarbers.map(async (barber) => {
        try {
          const appointmentsResponse = await axios.get(
            `${API}/barbers/${barber.id}/appointments`,
            {
              params: {
                date_from: date,
                date_to: date
              },   
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          return {
            ...barber,
            appointments: appointmentsResponse.data || [],
          };
        } catch (err) {
          console.error(`Error fetching appointments for ${barber.name}:`, err);
          return { ...barber, appointments: [] };
        }
      })
    );

      setBarbers(barbersWithAppointments);
    } catch (err) {
      setError('Failed to load appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

const formatSelectedDate = () => {
  const dateObj = new Date(selectedDate + "T00:00:00");

  return dateObj.toLocaleDateString("ro-RO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Bucharest",
  }).replace(/^\w/, (c) => c.toUpperCase());
};


  const getTotalAppointments = () => {
    return barbers.reduce((total, barber) => total + barber.appointments.length, 0);
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    
    if (hours < 9 || hours >= 19) return null; // Outside business hours
    
    const totalMinutes = (hours - 9) * 60 + minutes;
    const totalBusinessMinutes = 10 * 60; // 10 hours
    const percentage = (totalMinutes / totalBusinessMinutes) * 100;
    
    return percentage;
  };

  const isAppointmentPast = (appointmentTime) => {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const appointmentDate = new Date();
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate < currentTime;
  };

  const getAppointmentPosition = (appointmentTime, duration) => {
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startMinutes = (hours - 9) * 60 + minutes;
    const top = (startMinutes / (10 * 60)) * 100; // Percentage from top
    const height = (duration / (10 * 60)) * 100; // Height as percentage
    
    return { 
      top: `${top}%`, 
      height: `calc(${height}% - 4px)` // Subtract 4px for gap between appointments
    };
  };

  const handleEditDuration = (appointment) => {
    setEditingAppointment(appointment);
    setNewDuration(appointment.duration || 45);
  };

  const handleCloseDurationDialog = () => {
    setEditingAppointment(null);
    setNewDuration('');
  };

  const handleSaveDuration = async () => {
    if (!editingAppointment) return;
    
    const durationValue = parseInt(newDuration);
    
    if (!durationValue || durationValue < 15) {
      toast.error('Duration must be at least 15 minutes');
      return;
    }

    if (durationValue > editingAppointment.duration) {
      toast.error('You can only reduce the duration, not increase it');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('barber_token');
      
      await axios.patch(
        `${API}/appointments/${editingAppointment.id}/duration`,
        { duration: durationValue },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(`Duration updated to ${durationValue} minutes`);
      handleCloseDurationDialog();
      
      // Refresh appointments
      await fetchAllAppointments();
    } catch (error) {
      console.error('Error updating duration:', error);
      toast.error(error.response?.data?.detail || 'Failed to update duration');
    } finally {
      setUpdating(false);
    }
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
      const token = localStorage.getItem('barber_token');
      
      await axios.delete(
        `${API}/appointments/${deletingAppointment.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Appointment deleted successfully');
      handleCloseDeleteDialog();
      
      // Refresh appointments
      await fetchAllAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete appointment');
    } finally {
      setDeleting(false);
    }
  };

  const handleTimeSlotClick = (barberId, hour, minute, event) => {
    // Prevent if clicking on an appointment
    if (event.target.closest('.appointment-card')) {
      return;
    }

    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    setCreatingAppointment({
      barber_id: barberId,
      time: timeString,
      date: selectedDate
    });
    
    setNewAppointmentData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      service_id: '',
      notes: ''
    });
  };

  const handleCloseCreateDialog = () => {
    setCreatingAppointment(null);
    setNewAppointmentData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      service_id: '',
      notes: ''
    });
  };

const handleCreateAppointment = async () => {
    if (!creatingAppointment) return;

    if (!newAppointmentData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!newAppointmentData.customer_phone.trim()) {
      toast.error('Customer phone is required');
      return;
    }

    if (!newAppointmentData.customer_email.trim()) {
      toast.error('Customer email is required');
      return;
    }

    if (!newAppointmentData.service_id) {
      toast.error('Please select a service');
      return;
    }

    try {
      setCreating(true);
      const token = localStorage.getItem('barber_token');
      
      const selectedService = services.find(s => s.id.toString() === newAppointmentData.service_id.toString());
      
      if (!selectedService) {
        toast.error('Service not found');
        return;
      }

      const selectedBarber = barbers.find(b => b.id === creatingAppointment.barber_id);
      
      if (!selectedBarber) {
        toast.error('Barber not found');
        setCreating(false);
        return;
      }

      // Fetch fresh appointment data directly from API to avoid stale data
      console.log('Fetching latest appointments from API...');
      const freshAppointmentsResponse = await axios.get(
        `${API}/barbers/${creatingAppointment.barber_id}/appointments`,
        {
          params: {
            date_from: creatingAppointment.date,
            date_to: creatingAppointment.date
          },   
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const freshAppointments = freshAppointmentsResponse.data || [];
      console.log('Fresh appointments from API:', freshAppointments);
      
      // Log each appointment in detail
      console.log('Detailed appointment list:');
      freshAppointments.forEach((apt, index) => {
        const aptTime = apt.appointment_time || apt.time;
        const [aptHour, aptMinute] = aptTime.split(':').map(Number);
        const aptStartMinutes = aptHour * 60 + aptMinute;
        const aptEndMinutes = aptStartMinutes + (apt.duration || 45);
        const endHour = Math.floor(aptEndMinutes / 60);
        const endMinute = aptEndMinutes % 60;
        console.log(`  [${index}] ${apt.customer_name}: ${aptTime} - ${endHour}:${endMinute.toString().padStart(2, '0')} (${apt.duration || 45} min)`);
      });

      // Create a temporary barber object with fresh data for calculation
      const barberWithFreshData = {
        ...selectedBarber,
        appointments: freshAppointments
      };

      // Temporarily update the barbers array for calculation
      const originalBarbers = [...barbers];
      const barberIndex = barbers.findIndex(b => b.id === creatingAppointment.barber_id);
      const tempBarbers = [...barbers];
      tempBarbers[barberIndex] = barberWithFreshData;
      setBarbers(tempBarbers);

      // Calculate available time with fresh data
      const requestedDuration = selectedService.duration;
      
      // Recalculate with fresh data
      const [startHour, startMinute] = creatingAppointment.time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endOfDayMinutes = 19 * 60;
      
      let availableDuration = endOfDayMinutes - startMinutes; // Start with end of day
      
      // Check for conflicts with fresh data
      for (const apt of freshAppointments) {
        const aptTime = apt.appointment_time || apt.time;
        const [aptHour, aptMinute] = aptTime.split(':').map(Number);
        const aptStartMinutes = aptHour * 60 + aptMinute;
        const aptEndMinutes = aptStartMinutes + (apt.duration || 45);

        console.log(`Checking: ${apt.customer_name} at ${aptTime}, ends at ${Math.floor(aptEndMinutes/60)}:${(aptEndMinutes%60).toString().padStart(2, '0')} (Start: ${startMinutes}, Apt: ${aptStartMinutes}-${aptEndMinutes})`);

        // If clicked time is INSIDE an existing appointment (but not at the exact end time)
        // Appointments CAN start exactly when another ends
        if (startMinutes >= aptStartMinutes && startMinutes < aptEndMinutes) {
          console.log(`❌ Conflict: Clicked time ${startMinutes} is inside appointment ${aptStartMinutes}-${aptEndMinutes}`);
          toast.error(`This time slot is not available. It conflicts with an existing appointment.`);
          setBarbers(originalBarbers); // Restore original data
          setCreating(false);
          return;
        }

        // Find the next blocking appointment (appointments can touch at boundaries)
        if (aptStartMinutes > startMinutes && aptStartMinutes <= startMinutes + availableDuration) {
          const oldAvailable = availableDuration;
          // No buffer needed - appointments can start exactly when another ends
          availableDuration = aptStartMinutes - startMinutes;
          console.log(`Next appointment blocks at ${aptTime}. Available reduced from ${oldAvailable} to ${availableDuration}`);
        }
      }

      console.log(`Fresh calculation - Available: ${availableDuration} min, Requested: ${requestedDuration} min`);

      console.log(`Fresh calculation - Available: ${availableDuration} min, Requested: ${requestedDuration} min`);

      // If no time available at all
      if (availableDuration <= 0) {
        toast.error('No time available at this slot. The schedule has been updated. Please refresh.');
        setBarbers(originalBarbers);
        setCreating(false);
        return;
      }

      // Determine the actual duration to use
      let actualDuration = requestedDuration;
      let durationAdjusted = false;

      if (availableDuration < requestedDuration) {
        // For tight spaces (less than 30 minutes), don't apply buffer
        // For larger spaces, apply a small 2-minute buffer
        let adjustedAvailable = availableDuration;
        
        // if (availableDuration >= 30) {
        //   // Only apply buffer for larger time slots
        //   adjustedAvailable = availableDuration - 2;
        // }
        
        // Round down to nearest 15 minutes
        actualDuration = Math.floor(adjustedAvailable / 15) * 15;
        
        console.log(`After rounding: actualDuration=${actualDuration}, adjustedAvailable=${adjustedAvailable}`);
        
        // If rounding down gives us 0 or less than 15, but we have at least 15 available, use 15
        if (actualDuration < 15 && availableDuration >= 15) {
          actualDuration = 15;
          console.log(`Adjusted to minimum 15 minutes`);
        }
        
        console.log(`Adjusting duration from ${requestedDuration} to ${actualDuration} minutes (available: ${availableDuration}, adjusted: ${adjustedAvailable})`);
        
        if (actualDuration < 15) {
          toast.error(`Not enough time available. Need at least 15 minutes, but only ${availableDuration} minutes free before next appointment.`);
          setBarbers(originalBarbers);
          setCreating(false);
          return;
        }
        
        durationAdjusted = true;
      }
      
      const appointmentPayload = {
        barber_id: creatingAppointment.barber_id,
        barber_name: selectedBarber.name,
        customer_name: newAppointmentData.customer_name.trim(),
        customer_phone: newAppointmentData.customer_phone.trim(),
        customer_email: newAppointmentData.customer_email.trim(),
        service_id: newAppointmentData.service_id.toString(),
        service_name: selectedService.name,
        appointment_date: creatingAppointment.date,
        appointment_time: creatingAppointment.time,
        duration: actualDuration,
        price: selectedService.price || 0, // Ensure price is always a number
        status: 'confirmed'
      };
      
      if (newAppointmentData.notes.trim()) {
        appointmentPayload.notes = newAppointmentData.notes.trim();
      }

      console.log('Sending appointment payload:', appointmentPayload);
      console.log('Selected service details:', selectedService);
      console.log('Selected date:', creatingAppointment.date);
      console.log('Selected time:', creatingAppointment.time);
      console.log('Duration:', actualDuration);

      await axios.post(
        `${API}/appointments`,
        appointmentPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (durationAdjusted) {
        toast.success(`Appointment created with adjusted duration: ${actualDuration} minutes (original: ${requestedDuration} minutes)`);
      } else {
        toast.success('Appointment created successfully');
      }
      
      handleCloseCreateDialog();
      await fetchAllAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          toast.error(error.response.data.detail);
        } else if (Array.isArray(error.response.data.detail)) {
          const errorMessages = error.response.data.detail
            .map(err => `${err.loc?.join('.')}: ${err.msg}`)
            .join(', ');
          toast.error(errorMessages);
          console.log('Validation errors:', error.response.data.detail);
        } else {
          toast.error(JSON.stringify(error.response.data.detail));
        }
      } else {
        toast.error('Failed to create appointment');
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-zinc-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAllAppointments} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/barber-dashboard')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Button
              onClick={fetchAllAppointments}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>

                      <div className="flex items-center space-x-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAllAppointments(selectedDate)}
              >
                Load
              </Button>
            </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-zinc-900 mb-1">
                Today's Schedule - All Staff
              </h1>
              <div className="flex items-center space-x-2 text-sm text-zinc-600">
                <Calendar className="h-4 w-4" />
                <span>{formatSelectedDate()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {getTotalAppointments()}
              </div>
              <div className="text-xs text-zinc-600">
                Total Appointments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Calendar View */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Legend */}
          <div className="p-4 border-b bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-zinc-700">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-zinc-700">Upcoming</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-0.5 h-4 bg-red-500"></div>
                <span className="text-zinc-700">Current Time</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-zinc-600">
              <Plus className="h-4 w-4" />
              <span>Click any time slot to add appointment</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {/* Time Column */}
              <div className="w-20 flex-shrink-0 border-r bg-zinc-50">
                <div className="h-12 border-b flex items-center justify-center font-semibold text-sm text-zinc-700">
                  Time
                </div>
                {businessHours.map((hour) => (
                  <div
                    key={hour}
                    className="h-24 border-b flex items-start justify-center pt-2 text-sm text-zinc-600"
                  >
                    {hour}:00
                  </div>
                ))}
              </div>

              {/* Barber Columns */}
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="flex-1 min-w-64 border-r relative"
                >
                  {/* Barber Header */}
                  <div className="h-12 border-b bg-zinc-900 text-white flex items-center justify-center px-4">
                    <div className="text-center">
                      <div className="font-semibold text-sm">{barber.name}</div>
                      <div className="text-xs text-gray-300">
                        {barber.appointments.length} appointments
                      </div>
                    </div>
                  </div>

                  {/* Timeline Grid */}
                  <div className="relative" style={{ height: `${businessHours.length * 96}px` }}>
                    {/* Hour Lines (visual separators) */}
                    {businessHours.map((hour, index) => (
                      <div
                        key={`hour-${hour}`}
                        className="absolute w-full border-b border-zinc-300"
                        style={{ top: `${(index / businessHours.length) * 100}%`, height: '96px' }}
                      ></div>
                    ))}

                    {/* 15-minute clickable slots */}
                    {timeSlots.map((slot, index) => (
                      <div
                        key={`slot-${slot.hour}-${slot.minute}`}
                        className="absolute w-full border-b border-zinc-100 hover:bg-yellow-50 cursor-pointer transition-colors group"
                        style={{ 
                          top: `${(index / timeSlots.length) * 100}%`, 
                          height: `${100 / timeSlots.length}%`
                        }}
                        onClick={(e) => handleTimeSlotClick(barber.id, slot.hour, slot.minute, e)}
                        title={`Click to add appointment at ${slot.hour}:${slot.minute.toString().padStart(2, '0')}`}
                      >
                        {/* Show time label on hover for 15-min slots that aren't on the hour */}
                        {slot.minute !== 0 && (
                          <span className="absolute left-1 top-0 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {slot.hour}:{slot.minute.toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Current Time Indicator */}
                    {currentTimePosition !== null && (
                      <div
                        className="absolute w-full border-t-2 border-red-500 z-20"
                        style={{ top: `${currentTimePosition}%` }}
                      >
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
                      </div>
                    )}

                    {/* Appointments */}
                    {barber.appointments.map((appointment) => {
                      const position = getAppointmentPosition(
                        appointment.appointment_time || appointment.time,
                        appointment.duration || 45 // Default to 45 if missing
                      );
                      const isPast = isAppointmentPast(appointment.appointment_time || appointment.time);
                      
                      const duration = appointment.duration || 45;

                      return (
                        <div
                          key={appointment.id}
                          className={`absolute w-full px-0.5 z-10`}
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '48px'
                          }}
                          title={`${formatTime(appointment.appointment_time || appointment.time)} - ${appointment.customer_name} - ${appointment.service_name} (${duration} min) - ${appointment.price} RON - ${appointment.customer_phone}`}
                        >
                          <div
                            className={`h-full rounded p-1 shadow-md border-l-4 border ${
                              isPast
                                ? 'bg-green-50 border-green-500 border-green-200'
                                : 'bg-blue-50 border-blue-500 border-blue-200'
                            }`}
                          >
                            {/* Layout: Time (left) | Duration+Price (right) */}
                            <div className="h-full flex text-[9px] leading-tight">
                              {/* Left side: Time, Customer, Service */}
                              <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                                {/* Time */}
                                <div className="font-bold text-zinc-900 truncate text-[9px]">
                                  {formatTime(appointment.appointment_time || appointment.time)}
                                </div>
                                
                                {/* Customer name */}
                                <div className="font-semibold text-zinc-900 truncate">
                                  {appointment.customer_name}
                                </div>
                                
                                {/* Service */}
                                <div className="text-zinc-700 truncate text-[8px]">
                                  {appointment.service_name}
                                </div>
                              </div>
                              
                              {/* Right side: Duration + Price stacked */}
                              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                {/* Duration badge with edit button */}
                                <div 
                                  className="bg-white px-1 py-0.5 rounded border border-zinc-300 font-bold text-zinc-700 text-[8px] leading-none flex items-center gap-0.5 cursor-pointer hover:bg-zinc-100 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (appointment.status === 'confirmed') {
                                      handleEditDuration(appointment);
                                    }
                                  }}
                                  title={appointment.status === 'confirmed' ? 'Click to edit duration' : 'Duration editing only available for confirmed appointments'}
                                >
                                  {duration}m
                                  {appointment.status === 'confirmed' && (
                                    <Edit2 className="w-2 h-2 text-zinc-500" />
                                  )}
                                </div>
                                
                                {/* Price badge */}
                                <div className="bg-yellow-100 px-1 py-0.5 rounded font-bold text-yellow-800 text-[8px] leading-none whitespace-nowrap">
                                  {appointment.price || '?'} RON
                                </div>

                                                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(appointment);
                                  }}
                                  className="bg-red-100 hover:bg-red-200 px-1 py-0.5 rounded border border-red-300 transition-colors flex items-center gap-0.5"
                                  title="Delete appointment"
                                >
                                  <Trash2 className="w-2.5 h-2.5 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty State */}
                    {barber.appointments.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-zinc-400">
                          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No appointments</p>
                          <p className="text-xs mt-1">Click to add</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {barbers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600">No barbers found</p>
          </div>
        )}
      </section>

      {/* Create Appointment Dialog */}
      <Dialog open={!!creatingAppointment} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-md bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-2 pb-4 border-b border-zinc-200">
            <DialogTitle className="text-xl font-bold text-zinc-900">Create New Appointment</DialogTitle>
            <DialogDescription className="text-sm text-zinc-600">
              Add a new appointment for the selected time slot.
            </DialogDescription>
          </DialogHeader>
          
          {creatingAppointment && (
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg space-y-2 text-sm border border-yellow-200">
                <div className="text-zinc-800">
                  <span className="font-semibold text-zinc-900">Barber:</span>{' '}
                  {barbers.find(b => b.id === creatingAppointment.barber_id)?.name}
                </div>
                <div className="text-zinc-800">
                  <span className="font-semibold text-zinc-900">Date:</span> {formatSelectedDate()}
                </div>
                <div className="text-zinc-800">
                  <span className="font-semibold text-zinc-900">Time:</span> {formatTime(creatingAppointment.time)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-2">
                    Customer Name *
                  </label>
                  <Input
                    value={newAppointmentData.customer_name}
                    onChange={(e) => setNewAppointmentData({...newAppointmentData, customer_name: e.target.value})}
                    placeholder="Enter customer name"
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-2">
                    Customer Phone *
                  </label>
                  <Input
                    value={newAppointmentData.customer_phone}
                    onChange={(e) => setNewAppointmentData({...newAppointmentData, customer_phone: e.target.value})}
                    placeholder="Enter phone number"
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-2">
                    Customer Email *
                  </label>
                  <Input
                    type="email"
                    value={newAppointmentData.customer_email}
                    onChange={(e) => setNewAppointmentData({...newAppointmentData, customer_email: e.target.value})}
                    placeholder="Enter email address"
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-2">
                    Service *
                  </label>
                  <Select
                    value={newAppointmentData.service_id}
                    onValueChange={(value) => setNewAppointmentData({...newAppointmentData, service_id: value})}
                    disabled={creating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name} - {service.duration}min - {service.price} RON
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-900 block mb-2">
                    Notes (Optional)
                  </label>
                  <Input
                    value={newAppointmentData.notes}
                    onChange={(e) => setNewAppointmentData({...newAppointmentData, notes: e.target.value})}
                    placeholder="Add any notes"
                    disabled={creating}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateDialog}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAppointment}
              disabled={creating}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duration Edit Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={handleCloseDurationDialog}>
        <DialogContent className="sm:max-w-md bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="space-y-2 pb-4 border-b border-zinc-200">
            <DialogTitle className="text-xl font-bold text-zinc-900">Edit Appointment Duration</DialogTitle>
            <DialogDescription className="text-sm text-zinc-600">
              Modify the duration for this appointment. You can only reduce the duration, not increase it.
            </DialogDescription>
          </DialogHeader>
          
          {editingAppointment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">Appointment Details</div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg space-y-2 text-sm border border-yellow-200">
                  <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Customer:</span> {editingAppointment.customer_name}</div>
                  <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Service:</span> {editingAppointment.service_name}</div>
                  <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Time:</span> {formatTime(editingAppointment.appointment_time)}</div>
                  <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Current Duration:</span> {editingAppointment.duration} minutes</div>
                </div>
              </div>

              <div className="space-y-3 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <label htmlFor="duration" className="text-sm font-semibold text-zinc-900 uppercase tracking-wide block">
                  New Duration (minutes)
                </label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max={editingAppointment.duration}
                    step="15"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="flex-1 text-lg text-zinc-900 font-bold bg-white border-2 border-zinc-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
                    disabled={updating}
                    autoFocus
                  />
                  <span className="text-base font-semibold text-zinc-700">min</span>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-900 font-medium">
                    📌 Minimum: 15 minutes | Maximum: {editingAppointment.duration} minutes
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDurationDialog}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDuration}
              disabled={updating}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
                <div className="text-zinc-800"><span className="font-semibold text-zinc-900">Time:</span> {formatTime(deletingAppointment.appointment_time)}</div>
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

export default AllAppointments;