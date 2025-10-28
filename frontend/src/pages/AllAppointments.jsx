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
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

      {/* Appointments by Barber */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {barbers.map((barber) => (
            <Card key={barber.id} className="overflow-hidden">
              <CardHeader className="bg-zinc-900 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {barber.image_url && (
                      <img
                        src={barber.image_url}
                        alt={barber.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{barber.name}</CardTitle>
                      <p className="text-sm text-gray-300">
                        {barber.appointments.length} appointment{barber.appointments.length !== 1 ? 's' : ''} today
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={barber.is_available ? "success" : "secondary"}
                    className={barber.is_available ? "bg-green-600" : "bg-gray-600"}
                  >
                    {barber.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {barber.appointments.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    No appointments scheduled for today
                  </div>
                ) : (
                  <div className="divide-y">
                    {barber.appointments
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className="p-4 hover:bg-zinc-50 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Time */}
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-yellow-600" />
                              <div>
                                <div className="font-semibold text-zinc-900">
                                  {formatTime(appointment.time)}
                                </div>
                                <div className="text-xs text-zinc-500">
                                  {appointment.duration} min
                                </div>
                              </div>
                            </div>

                            {/* Customer */}
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-zinc-400" />
                              <div>
                                <div className="font-medium text-zinc-900">
                                  {appointment.customer_name}
                                </div>
                                <div className="text-xs text-zinc-500">
                                  Customer
                                </div>
                              </div>
                            </div>

                            {/* Service */}
                            <div>
                              <div className="font-medium text-zinc-900">
                                {appointment.service_name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                ${appointment.price}
                              </div>
                            </div>

                            {/* Contact */}
                            <div className="text-sm text-zinc-600 space-y-1">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{appointment.customer_phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{appointment.customer_email}</span>
                              </div>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-zinc-700">
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

        {barbers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600">No barbers found</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllAppointments;
