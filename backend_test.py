#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional

class BarbershopAPITester:
    def __init__(self, base_url="https://barber-timeline.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.auth_token = None
        self.barber_id = None
        self.barber_name = None

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("API Root Endpoint", success, details)
            return success
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Error: {str(e)}")
            return False

    def test_init_data(self):
        """Test data initialization endpoint"""
        try:
            response = requests.post(f"{self.api_url}/init-data", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Barbers: {data.get('barbers_count')}, Services: {data.get('services_count')}"
                details += f", Auth accounts: {data.get('barber_auth_count')}"
            self.log_test("Initialize Data", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Initialize Data", False, f"Error: {str(e)}")
            return False, None

    def test_get_barbers(self):
        """Test getting all barbers - should return Oxy, Helga, Marcus"""
        try:
            response = requests.get(f"{self.api_url}/barbers", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                barbers = response.json()
                details += f", Found {len(barbers)} barbers"
                
                # Check for expected barbers
                barber_names = [b.get('name') for b in barbers]
                expected_barbers = ['Oxy', 'Helga']  # Based on init-data
                
                for expected in expected_barbers:
                    if expected not in barber_names:
                        success = False
                        details += f", Missing barber: {expected}"
                
                if success and barbers:
                    details += f", Barbers: {', '.join(barber_names)}"
                    # Validate barber structure
                    barber = barbers[0]
                    required_fields = ['id', 'name', 'description', 'experience_years', 'specialties']
                    missing_fields = [field for field in required_fields if field not in barber]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                
            self.log_test("Get Barbers", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Barbers", False, f"Error: {str(e)}")
            return False, []

    def test_get_barber_by_id(self, barber_id: str):
        """Test getting specific barber details"""
        try:
            response = requests.get(f"{self.api_url}/barbers/{barber_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                barber = response.json()
                details += f", Barber: {barber.get('name')}, Experience: {barber.get('experience_years')} years"
                details += f", Specialties: {len(barber.get('specialties', []))}"
                
            self.log_test("Get Barber by ID", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Get Barber by ID", False, f"Error: {str(e)}")
            return False, None

    def test_barber_services(self, barber_id: str):
        """Test getting barber-specific services with custom pricing"""
        try:
            response = requests.get(f"{self.api_url}/barbers/{barber_id}/services", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                services = response.json()
                details += f", Found {len(services)} services for barber"
                
                if services:
                    service = services[0]
                    required_fields = ['id', 'barber_id', 'service_id', 'price', 'service_name', 'duration']
                    missing_fields = [field for field in required_fields if field not in service]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                    else:
                        details += f", Example: {service['service_name']} - ${service['price']}"
                
            self.log_test("Get Barber Services", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Barber Services", False, f"Error: {str(e)}")
            return False, []

    def test_barber_login(self, email: str = "oxy@oxyssbarbershop.com", password: str = "barber123"):
        """Test barber authentication login"""
        try:
            login_data = {
                "email": email,
                "password": password
            }
            
            response = requests.post(
                f"{self.api_url}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                auth_data = response.json()
                self.auth_token = auth_data.get('access_token')
                self.barber_id = auth_data.get('barber_id')
                self.barber_name = auth_data.get('barber_name')
                details += f", Logged in as: {self.barber_name}, Token type: {auth_data.get('token_type')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Barber Login", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Barber Login", False, f"Error: {str(e)}")
            return False, None

    def get_auth_headers(self):
        """Get authorization headers for authenticated requests"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}

    def test_get_services(self):
        """Test getting all base services"""
        try:
            response = requests.get(f"{self.api_url}/services", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                services = response.json()
                details += f", Found {len(services)} services"
                
                # Validate service structure
                if services:
                    service = services[0]
                    required_fields = ['id', 'name', 'description', 'duration', 'base_price']
                    missing_fields = [field for field in required_fields if field not in service]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                    else:
                        details += f", Service example: {service['name']} - ${service['base_price']}"
                
            self.log_test("Get Services", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Services", False, f"Error: {str(e)}")
            return False, []

    def test_available_slots(self, barber_id: str, service_id: str):
        """Test checking available slots for booking"""
        try:
            # Test for tomorrow's date
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            response = requests.get(
                f"{self.api_url}/barbers/{barber_id}/available-slots",
                params={"date": tomorrow, "service_id": service_id},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                slots_data = response.json()
                slots = slots_data.get('slots', [])
                available_slots = [slot for slot in slots if slot.get('available')]
                details += f", Date: {slots_data.get('date')}, Total slots: {len(slots)}, Available: {len(available_slots)}"
                
                if slots:
                    details += f", Duration: {slots_data.get('service_duration')} min"
                
            self.log_test("Get Available Slots", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Get Available Slots", False, f"Error: {str(e)}")
            return False, None

    def test_create_appointment(self, barber_id: str, service_id: str, service_name: str):
        """Test creating an appointment with barber selection"""
        try:
            # Use tomorrow's date and a reasonable time
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            test_appointment = {
                "customer_name": "Sarah Johnson",
                "customer_email": "sarah.johnson@example.com",
                "customer_phone": "(555) 987-6543",
                "service_id": service_id,
                "service_name": service_name,
                "barber_id": barber_id,
                "barber_name": self.barber_name or "Test Barber",
                "appointment_date": tomorrow,
                "appointment_time": "10:00:00"
            }
            
            response = requests.post(
                f"{self.api_url}/appointments",
                json=test_appointment,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointment = response.json()
                details += f", Appointment ID: {appointment.get('id')}"
                details += f", Status: {appointment.get('status')}"
                details += f", Barber: {appointment.get('barber_name')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Create Appointment", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Appointment", False, f"Error: {str(e)}")
            return False, None

    def test_get_barber_appointments(self, barber_id: str):
        """Test getting barber appointments (requires authentication)"""
        try:
            headers = self.get_auth_headers()
            response = requests.get(
                f"{self.api_url}/barbers/{barber_id}/appointments",
                headers=headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointments = response.json()
                details += f", Found {len(appointments)} appointments for barber"
                
                if appointments:
                    details += f", Latest: {appointments[0].get('customer_name')} on {appointments[0].get('appointment_date')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Get Barber Appointments", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Barber Appointments", False, f"Error: {str(e)}")
            return False, []

    def test_get_today_appointments(self):
        """Test getting today's appointments"""
        try:
            response = requests.get(f"{self.api_url}/appointments/today", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointments = response.json()
                details += f", Found {len(appointments)} appointments for today"
                
            self.log_test("Get Today's Appointments", success, details)
            return success
        except Exception as e:
            self.log_test("Get Today's Appointments", False, f"Error: {str(e)}")
            return False

    def test_create_barber_break(self, barber_id: str):
        """Test creating a barber break (requires authentication)"""
        try:
            headers = self.get_auth_headers()
            headers["Content-Type"] = "application/json"
            
            # Create break for tomorrow
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
            break_data = {
                "barber_id": barber_id,
                "break_date": tomorrow,
                "start_time": "12:00:00",
                "end_time": "13:00:00",
                "title": "Lunch Break"
            }
            
            response = requests.post(
                f"{self.api_url}/breaks",
                json=break_data,
                headers=headers,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                break_obj = response.json()
                details += f", Break ID: {break_obj.get('id')}"
                details += f", Title: {break_obj.get('title')}"
                details += f", Date: {break_obj.get('break_date')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Create Barber Break", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Barber Break", False, f"Error: {str(e)}")
            return False, None

    def test_get_barber_breaks(self, barber_id: str):
        """Test getting barber breaks"""
        try:
            response = requests.get(f"{self.api_url}/barbers/{barber_id}/breaks", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                breaks = response.json()
                details += f", Found {len(breaks)} breaks for barber"
                
                if breaks:
                    latest_break = breaks[0]
                    details += f", Latest: {latest_break.get('title')} on {latest_break.get('break_date')}"
                
            self.log_test("Get Barber Breaks", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Barber Breaks", False, f"Error: {str(e)}")
            return False, []

    def test_create_contact_message(self):
        """Test creating a contact message"""
        try:
            test_message = {
                "name": "Michael Rodriguez",
                "email": "michael.rodriguez@example.com",
                "message": "I'd like to schedule a consultation for a premium haircut and beard styling. What are your available times this week?"
            }
            
            response = requests.post(
                f"{self.api_url}/contact",
                json=test_message,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                message = response.json()
                details += f", Message ID: {message.get('id')}"
                details += f", From: {message.get('name')}"
                
            self.log_test("Create Contact Message", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Contact Message", False, f"Error: {str(e)}")
            return False, None

    def test_get_contact_messages(self):
        """Test getting all contact messages"""
        try:
            response = requests.get(f"{self.api_url}/contact", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                messages = response.json()
                details += f", Found {len(messages)} messages"
                
            self.log_test("Get Contact Messages", success, details)
            return success
        except Exception as e:
            self.log_test("Get Contact Messages", False, f"Error: {str(e)}")
            return False

    def test_migrate_appointments(self):
        """Test the migration endpoint for existing appointments"""
        try:
            response = requests.post(f"{self.api_url}/migrate-appointments", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                migration_data = response.json()
                details += f", Updated: {migration_data.get('updated')}, Skipped: {migration_data.get('skipped')}"
                details += f", Errors: {migration_data.get('errors')}, Total: {migration_data.get('total')}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Migrate Appointments", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Migrate Appointments", False, f"Error: {str(e)}")
            return False, None

    def test_today_appointments_with_duration_price(self):
        """Test GET /api/appointments/today returns appointments with duration and price fields"""
        try:
            response = requests.get(f"{self.api_url}/appointments/today", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointments = response.json()
                details += f", Found {len(appointments)} appointments for today"
                
                # Check if appointments have duration and price fields
                for appointment in appointments:
                    if 'duration' not in appointment or 'price' not in appointment:
                        success = False
                        details += f", Missing duration/price in appointment {appointment.get('id', 'unknown')}"
                        break
                    else:
                        details += f", Appointment: {appointment.get('customer_name')} - Duration: {appointment.get('duration')}min, Price: {appointment.get('price')} RON"
                        
                        # Check for specific appointment mentioned in review request
                        if appointment.get('customer_name') == 'Szabolcs-Csaba Solyom' and appointment.get('appointment_time', '').startswith('10:00'):
                            if appointment.get('service_name') == 'Classic Haircut':
                                expected_duration = 45
                                expected_price = 40.0  # Based on Oxy's pricing
                                if appointment.get('duration') != expected_duration:
                                    success = False
                                    details += f", WRONG DURATION: Expected {expected_duration}, got {appointment.get('duration')}"
                                if appointment.get('price') != expected_price:
                                    success = False
                                    details += f", WRONG PRICE: Expected {expected_price}, got {appointment.get('price')}"
                                if success:
                                    details += f", ✅ Szabolcs appointment verified: {expected_duration}min, {expected_price} RON"
                
            self.log_test("Today Appointments with Duration/Price", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Today Appointments with Duration/Price", False, f"Error: {str(e)}")
            return False, []

    def test_create_appointment_with_duration_price(self, barber_id: str, service_id: str, service_name: str):
        """Test POST /api/appointments creates appointments with correct duration and price"""
        try:
            # Use today's date for testing
            today = datetime.now().strftime('%Y-%m-%d')
            
            test_appointment = {
                "customer_name": "Test Customer Duration Price",
                "customer_email": "test.duration@example.com",
                "customer_phone": "(555) 123-4567",
                "service_id": service_id,
                "service_name": service_name,
                "barber_id": barber_id,
                "barber_name": self.barber_name or "Test Barber",
                "appointment_date": today,
                "appointment_time": "14:00:00"
            }
            
            response = requests.post(
                f"{self.api_url}/appointments",
                json=test_appointment,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointment = response.json()
                duration = appointment.get('duration')
                price = appointment.get('price')
                
                if duration is None or price is None:
                    success = False
                    details += f", Missing duration or price fields"
                else:
                    details += f", Created appointment with Duration: {duration}min, Price: {price} RON"
                    details += f", Service: {appointment.get('service_name')}, Barber: {appointment.get('barber_name')}"
                    
                    # Verify duration and price are reasonable
                    if duration < 15 or duration > 120:
                        success = False
                        details += f", Invalid duration: {duration}"
                    if price < 10 or price > 100:
                        success = False
                        details += f", Invalid price: {price}"
            else:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text}"
                
            self.log_test("Create Appointment with Duration/Price", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Appointment with Duration/Price", False, f"Error: {str(e)}")
            return False, None

    def test_specific_appointment_szabolcs(self):
        """Test for the specific appointment mentioned in review request"""
        try:
            # First, create the specific appointment if it doesn't exist
            # Get Oxy's barber ID and Classic Haircut service ID
            barbers_response = requests.get(f"{self.api_url}/barbers", timeout=10)
            if barbers_response.status_code != 200:
                self.log_test("Get Oxy Barber for Szabolcs Test", False, "Could not get barbers")
                return False
                
            barbers = barbers_response.json()
            oxy_barber = None
            for barber in barbers:
                if barber.get('name') == 'Oxy':
                    oxy_barber = barber
                    break
                    
            if not oxy_barber:
                self.log_test("Find Oxy Barber", False, "Oxy barber not found")
                return False
                
            # Get Classic Haircut service
            services_response = requests.get(f"{self.api_url}/services", timeout=10)
            if services_response.status_code != 200:
                self.log_test("Get Services for Szabolcs Test", False, "Could not get services")
                return False
                
            services = services_response.json()
            classic_haircut = None
            for service in services:
                if service.get('name') == 'Classic Haircut':
                    classic_haircut = service
                    break
                    
            if not classic_haircut:
                self.log_test("Find Classic Haircut Service", False, "Classic Haircut service not found")
                return False
                
            # Create the specific appointment for today
            today = datetime.now().strftime('%Y-%m-%d')
            szabolcs_appointment = {
                "customer_name": "Szabolcs-Csaba Solyom",
                "customer_email": "szabolcs.solyom@example.com",
                "customer_phone": "(555) 100-0000",
                "service_id": classic_haircut['id'],
                "service_name": "Classic Haircut",
                "barber_id": oxy_barber['id'],
                "barber_name": "Oxy",
                "appointment_date": today,
                "appointment_time": "10:00:00"
            }
            
            create_response = requests.post(
                f"{self.api_url}/appointments",
                json=szabolcs_appointment,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = create_response.status_code == 200
            details = f"Create Status: {create_response.status_code}"
            
            if success:
                appointment = create_response.json()
                duration = appointment.get('duration')
                price = appointment.get('price')
                
                expected_duration = 45  # Classic Haircut duration
                expected_price = 40.0   # Oxy's price for Classic Haircut
                
                if duration != expected_duration:
                    success = False
                    details += f", WRONG DURATION: Expected {expected_duration}, got {duration}"
                if price != expected_price:
                    success = False
                    details += f", WRONG PRICE: Expected {expected_price}, got {price}"
                    
                if success:
                    details += f", ✅ Szabolcs appointment created correctly: {duration}min, {price} RON"
            else:
                try:
                    error_data = create_response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {create_response.text}"
                
            self.log_test("Szabolcs-Csaba Solyom Appointment Test", success, details)
            return success
        except Exception as e:
            self.log_test("Szabolcs-Csaba Solyom Appointment Test", False, f"Error: {str(e)}")
            return False

    def run_duration_price_tests(self):
        """Run focused tests for appointment duration and price functionality"""
        print("🧪 Starting Duration & Price Testing for Barber Dashboard")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
            
        # Initialize data (barbers, services, auth)
        print("\n📋 Testing Data Initialization...")
        init_success, init_data = self.test_init_data()
        
        # Test migration endpoint
        print("\n🔄 Testing Appointment Migration...")
        self.test_migrate_appointments()
        
        # Test authentication
        print("\n🔐 Testing Authentication...")
        auth_success, auth_data = self.test_barber_login()
        
        # Get barber and service data for testing
        print("\n👨‍💼 Getting Barber and Service Data...")
        barbers_success, barbers = self.test_get_barbers()
        services_success, services = self.test_get_services()
        
        barber_id = None
        service_id = None
        service_name = None
        if barbers_success and barbers and services_success and services:
            barber_id = barbers[0]['id']
            service_id = services[0]['id']
            service_name = services[0]['name']
        
        # Test specific appointment creation and verification
        print("\n📝 Testing Specific Appointment (Szabolcs-Csaba Solyom)...")
        self.test_specific_appointment_szabolcs()
        
        # Test today's appointments endpoint
        print("\n📅 Testing Today's Appointments with Duration/Price...")
        self.test_today_appointments_with_duration_price()
        
        # Test creating new appointments with duration/price
        if barber_id and service_id and service_name:
            print("\n➕ Testing New Appointment Creation with Duration/Price...")
            self.test_create_appointment_with_duration_price(barber_id, service_id, service_name)
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All duration/price tests passed! Appointment display should work correctly.")
            return True
        else:
            print(f"\n⚠️  {len(failed_tests)} tests failed. Check the details above.")
            return False

    def run_all_tests(self):
        """Run comprehensive API test suite for Oxy'ss Barbershop"""
        print("🧪 Starting Oxy'ss Barbershop API Test Suite")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
            
        # Initialize data (barbers, services, auth)
        print("\n📋 Testing Data Initialization...")
        init_success, init_data = self.test_init_data()
        
        # Test barber endpoints
        print("\n👨‍💼 Testing Barber Endpoints...")
        barbers_success, barbers = self.test_get_barbers()
        
        barber_id = None
        if barbers_success and barbers:
            barber_id = barbers[0]['id']
            self.test_get_barber_by_id(barber_id)
            self.test_barber_services(barber_id)
        
        # Test service endpoints
        print("\n✂️ Testing Service Endpoints...")
        services_success, services = self.test_get_services()
        
        service_id = None
        service_name = None
        if services_success and services:
            service_id = services[0]['id']
            service_name = services[0]['name']
        
        # Test authentication
        print("\n🔐 Testing Authentication...")
        auth_success, auth_data = self.test_barber_login()
        
        # Test availability checking
        if barber_id and service_id:
            print("\n📅 Testing Availability...")
            self.test_available_slots(barber_id, service_id)
        
        # Test appointment endpoints
        print("\n📝 Testing Appointment Endpoints...")
        appointment_id = None
        if barber_id and service_id and service_name:
            appointment_success, appointment = self.test_create_appointment(barber_id, service_id, service_name)
            if appointment_success and appointment:
                appointment_id = appointment['id']
        
        self.test_get_today_appointments()
        
        # Test authenticated barber endpoints
        if auth_success and self.barber_id:
            print("\n🔒 Testing Authenticated Endpoints...")
            self.test_get_barber_appointments(self.barber_id)
            self.test_create_barber_break(self.barber_id)
            self.test_get_barber_breaks(self.barber_id)
        
        # Test contact messages
        print("\n📧 Testing Contact Messages...")
        self.test_create_contact_message()
        self.test_get_contact_messages()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All tests passed! MongoDB connection fix successful.")
            return True
        else:
            print(f"\n⚠️  {len(failed_tests)} tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = BarbershopAPITester()
    success = tester.run_all_tests()
    
    # Create test reports directory if it doesn't exist
    import os
    os.makedirs("/app/test_reports", exist_ok=True)
    
    # Save detailed results
    results_file = "/app/test_reports/backend_api_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "failed_tests": tester.tests_run - tester.tests_passed,
                "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat(),
                "mongodb_fix_verified": success
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())