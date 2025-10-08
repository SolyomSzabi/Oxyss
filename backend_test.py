#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, date
from typing import Dict, Any

class BarbershopAPITester:
    def __init__(self, base_url="https://fine-cuts.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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

    def test_init_services(self):
        """Test service initialization"""
        try:
            response = requests.post(f"{self.api_url}/init-services", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("Initialize Services", success, details)
            return success
        except Exception as e:
            self.log_test("Initialize Services", False, f"Error: {str(e)}")
            return False

    def test_get_services(self):
        """Test getting all services"""
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
                    required_fields = ['id', 'name', 'description', 'duration', 'price']
                    missing_fields = [field for field in required_fields if field not in service]
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                    else:
                        details += f", Service example: {service['name']} - ${service['price']}"
                
            self.log_test("Get Services", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Services", False, f"Error: {str(e)}")
            return False, []

    def test_create_service(self):
        """Test creating a new service"""
        try:
            test_service = {
                "name": "Test Service",
                "description": "A test service for API testing",
                "duration": 30,
                "price": 25.0
            }
            
            response = requests.post(
                f"{self.api_url}/services", 
                json=test_service,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                created_service = response.json()
                details += f", Created service ID: {created_service.get('id')}"
                
                # Validate created service
                for key, value in test_service.items():
                    if created_service.get(key) != value:
                        success = False
                        details += f", Mismatch in {key}: expected {value}, got {created_service.get(key)}"
                        break
                        
            self.log_test("Create Service", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Service", False, f"Error: {str(e)}")
            return False, None

    def test_create_appointment(self, service_id: str):
        """Test creating an appointment"""
        try:
            test_appointment = {
                "customer_name": "John Doe",
                "customer_email": "john.doe@example.com",
                "customer_phone": "(555) 123-4567",
                "service_id": service_id,
                "service_name": "Test Service",
                "appointment_date": "2024-12-20",
                "appointment_time": "14:30:00"
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
                
            self.log_test("Create Appointment", success, details)
            return success, response.json() if success else None
        except Exception as e:
            self.log_test("Create Appointment", False, f"Error: {str(e)}")
            return False, None

    def test_get_appointments(self):
        """Test getting all appointments"""
        try:
            response = requests.get(f"{self.api_url}/appointments", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointments = response.json()
                details += f", Found {len(appointments)} appointments"
                
            self.log_test("Get Appointments", success, details)
            return success
        except Exception as e:
            self.log_test("Get Appointments", False, f"Error: {str(e)}")
            return False

    def test_get_appointment_by_id(self, appointment_id: str):
        """Test getting specific appointment"""
        try:
            response = requests.get(f"{self.api_url}/appointments/{appointment_id}", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                appointment = response.json()
                details += f", Customer: {appointment.get('customer_name')}"
                
            self.log_test("Get Appointment by ID", success, details)
            return success
        except Exception as e:
            self.log_test("Get Appointment by ID", False, f"Error: {str(e)}")
            return False

    def test_update_appointment_status(self, appointment_id: str):
        """Test updating appointment status"""
        try:
            response = requests.patch(
                f"{self.api_url}/appointments/{appointment_id}",
                params={"status": "confirmed"},
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                result = response.json()
                details += f", Message: {result.get('message')}"
                
            self.log_test("Update Appointment Status", success, details)
            return success
        except Exception as e:
            self.log_test("Update Appointment Status", False, f"Error: {str(e)}")
            return False

    def test_create_contact_message(self):
        """Test creating a contact message"""
        try:
            test_message = {
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "message": "This is a test contact message from the API test suite."
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

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🧪 Starting Oxy'ss Barbershop API Test Suite")
        print("=" * 50)
        
        # Test basic connectivity
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
            
        # Initialize services
        self.test_init_services()
        
        # Test services
        services_success, services = self.test_get_services()
        service_id = None
        
        if services_success and services:
            service_id = services[0]['id']
        else:
            # Create a service for testing
            create_success, created_service = self.test_create_service()
            if create_success and created_service:
                service_id = created_service['id']
        
        # Test appointments
        appointment_id = None
        if service_id:
            appointment_success, appointment = self.test_create_appointment(service_id)
            if appointment_success and appointment:
                appointment_id = appointment['id']
                
        self.test_get_appointments()
        
        if appointment_id:
            self.test_get_appointment_by_id(appointment_id)
            self.test_update_appointment_status(appointment_id)
        
        # Test contact messages
        self.test_create_contact_message()
        self.test_get_contact_messages()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = BarbershopAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results_file = "/app/test_reports/backend_api_results.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "detailed_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())