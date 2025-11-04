import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Phone, Mail, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AllAppointments = () => {
  const navigate = useNavigate();
  const { barberData } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!barberData) {
      navigate('/barber-login');
      return;
    }
    fetchAllAppointments();
  }, [barberData, navigate]);

  const fetchAllAppointments = async () => {
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
              `${API}/barbers/${barber.id}/appointments/today`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            return {
              ...barber,
              appointments: appointmentsResponse.data || []
            };
          } catch (err) {
            console.error(`Error fetching appointments for ${barber.name}:`, err);
            return {
              ...barber,
              appointments: []
            };
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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTodayString = () => {
    // Get Romanian timezone date
    const today = new Date().toLocaleDateString('ro-RO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Europe/Bucharest'
    });
    return today.charAt(0).toUpperCase() + today.slice(1); // Capitalize first letter
  };

  const getTotalAppointments = () => {
    return barbers.reduce((total, barber) => total + barber.appointments.length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-zinc-600">Loading appointments...</p>
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

  return (
    <div className="min-h-screen bg-zinc-50 pt-16">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/barber-dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <Button
              onClick={fetchAllAppointments}
              variant="outline"
              size="sm"
            >
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-zinc-900 mb-2">
                Today's Schedule - All Barbers
              </h1>
              <div className="flex items-center space-x-2 text-zinc-600">
                <Calendar className="h-4 w-4" />
                <span>{getTodayString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">
                {getTotalAppointments()}
              </div>
              <div className="text-sm text-zinc-600">
                Total Appointments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointments by Barber - Column Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {barbers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">No barbers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber) => (
              <Card key={barber.id} className="overflow-hidden flex flex-col h-full">
                <CardHeader className="bg-zinc-900 text-white pb-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {barber.image_url && (
                      <img
                        src={barber.image_url}
                        alt={barber.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-yellow-600"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl mb-1">{barber.name}</CardTitle>
                      <p className="text-sm text-gray-300">
                        {barber.appointments.length} appointment{barber.appointments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge 
                      variant={barber.is_available ? "success" : "secondary"}
                      className={barber.is_available ? "bg-green-600" : "bg-gray-600"}
                    >
                      {barber.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
                  {barber.appointments.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500 text-sm">
                      No appointments scheduled for today
                    </div>
                  ) : (
                    <div className="divide-y">
                      {barber.appointments
                        .sort((a, b) => {
                          const timeA = a.appointment_time || a.time || '00:00:00';
                          const timeB = b.appointment_time || b.time || '00:00:00';
                          return timeA.localeCompare(timeB);
                        })
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="p-4 hover:bg-zinc-50 transition-colors"
                          >
                            {/* Time */}
                            <div className="flex items-center space-x-2 mb-3">
                              <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-zinc-900">
                                  {formatTime(appointment.appointment_time || appointment.time)}
                                </div>
                                <div className="text-xs text-zinc-500">
                                  {appointment.duration} min
                                </div>
                              </div>
                            </div>

                            {/* Customer */}
                            <div className="flex items-start space-x-2 mb-2">
                              <User className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-zinc-900 text-sm truncate">
                                  {appointment.customer_name}
                                </div>
                              </div>
                            </div>

                            {/* Service */}
                            <div className="mb-2 pl-6">
                              <div className="font-medium text-zinc-900 text-sm">
                                {appointment.service_name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {appointment.price} RON
                              </div>
                            </div>

                            {/* Contact */}
                            <div className="text-xs text-zinc-600 space-y-1 pl-6">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{appointment.customer_phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{appointment.customer_email}</span>
                              </div>
                            </div>

                            {appointment.notes && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-zinc-700">
                                <strong>Notes:</strong> {appointment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllAppointments;
