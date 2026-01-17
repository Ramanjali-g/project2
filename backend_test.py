import requests
import sys
import json
from datetime import datetime

class EndlessPathAPITester:
    def __init__(self, base_url="https://endless-path-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.customer_token = None
        self.provider_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("\n🔍 Testing Basic Connectivity...")
        success, _ = self.run_test("API Root Endpoint", "GET", "", 200)
        return success

    def test_categories(self):
        """Test categories endpoint"""
        print("\n🔍 Testing Categories...")
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list) and len(response) > 0:
            self.log_test("Categories Data Validation", True, f"Found {len(response)} categories")
            return True
        else:
            self.log_test("Categories Data Validation", False, "No categories found or invalid response")
            return False

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔍 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@endlesspath.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            self.log_test("Admin Token Received", True)
            return True
        else:
            self.log_test("Admin Token Received", False, "No access token in response")
            return False

    def test_customer_registration_and_login(self):
        """Test customer registration and login"""
        print("\n🔍 Testing Customer Registration & Login...")
        
        # Generate unique email for testing
        timestamp = datetime.now().strftime("%H%M%S")
        customer_email = f"testcustomer{timestamp}@test.com"
        
        # Test registration
        success, response = self.run_test(
            "Customer Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": customer_email,
                "password": "testpass123",
                "full_name": "Test Customer",
                "phone": "+919876543210",
                "role": "customer"
            }
        )
        
        if not success:
            return False

        # Test login
        success, response = self.run_test(
            "Customer Login",
            "POST",
            "auth/login",
            200,
            data={"email": customer_email, "password": "testpass123"}
        )
        
        if success and 'access_token' in response:
            self.customer_token = response['access_token']
            self.log_test("Customer Token Received", True)
            return True
        else:
            self.log_test("Customer Token Received", False)
            return False

    def test_provider_registration_and_login(self):
        """Test provider registration and login"""
        print("\n🔍 Testing Provider Registration & Login...")
        
        # Generate unique email for testing
        timestamp = datetime.now().strftime("%H%M%S")
        provider_email = f"testprovider{timestamp}@test.com"
        
        # Test registration
        success, response = self.run_test(
            "Provider Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": provider_email,
                "password": "testpass123",
                "full_name": "Test Provider",
                "phone": "+919876543211",
                "role": "provider",
                "service_category": "Home Services",
                "experience_years": 5,
                "description": "Experienced home service provider"
            }
        )
        
        if not success:
            return False

        # Test login
        success, response = self.run_test(
            "Provider Login",
            "POST",
            "auth/login",
            200,
            data={"email": provider_email, "password": "testpass123"}
        )
        
        if success and 'access_token' in response:
            self.provider_token = response['access_token']
            self.log_test("Provider Token Received", True)
            return True
        else:
            self.log_test("Provider Token Received", False)
            return False

    def test_protected_endpoints(self):
        """Test protected endpoints with authentication"""
        print("\n🔍 Testing Protected Endpoints...")
        
        if not self.customer_token:
            self.log_test("Customer Protected Endpoints", False, "No customer token available")
            return False

        # Test customer endpoints
        success, _ = self.run_test(
            "Get Customer Profile",
            "GET",
            "auth/me",
            200,
            token=self.customer_token
        )

        success2, _ = self.run_test(
            "Get Customer Bookings",
            "GET",
            "bookings/customer/me",
            200,
            token=self.customer_token
        )

        return success and success2

    def test_admin_endpoints(self):
        """Test admin-specific endpoints"""
        print("\n🔍 Testing Admin Endpoints...")
        
        if not self.admin_token:
            self.log_test("Admin Endpoints", False, "No admin token available")
            return False

        # Test admin stats
        success1, _ = self.run_test(
            "Get Admin Stats",
            "GET",
            "admin/stats",
            200,
            token=self.admin_token
        )

        # Test get providers
        success2, _ = self.run_test(
            "Get All Providers",
            "GET",
            "admin/providers",
            200,
            token=self.admin_token
        )

        # Test get users
        success3, _ = self.run_test(
            "Get All Users",
            "GET",
            "admin/users",
            200,
            token=self.admin_token
        )

        return success1 and success2 and success3

    def test_services_endpoints(self):
        """Test services-related endpoints"""
        print("\n🔍 Testing Services Endpoints...")
        
        # Test get services (public endpoint)
        success, response = self.run_test(
            "Get All Services",
            "GET",
            "services",
            200
        )

        if success:
            self.log_test("Services Data Validation", True, f"Found {len(response)} services")
        
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("\n🔍 Testing Unauthorized Access...")
        
        # Test accessing protected endpoint without token
        success, _ = self.run_test(
            "Unauthorized Access Test",
            "GET",
            "auth/me",
            401  # Should return 401 Unauthorized
        )

        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Endless Path API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Basic connectivity
        if not self.test_basic_connectivity():
            print("❌ Basic connectivity failed. Stopping tests.")
            return False

        # Test categories (public endpoint)
        self.test_categories()

        # Test authentication
        admin_auth_success = self.test_admin_login()
        customer_auth_success = self.test_customer_registration_and_login()
        provider_auth_success = self.test_provider_registration_and_login()

        # Test protected endpoints if auth succeeded
        if customer_auth_success:
            self.test_protected_endpoints()

        if admin_auth_success:
            self.test_admin_endpoints()

        # Test services
        self.test_services_endpoints()

        # Test unauthorized access
        self.test_unauthorized_access()

        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")

        # Return success if more than 80% tests passed
        return (self.tests_passed / self.tests_run) >= 0.8

def main():
    tester = EndlessPathAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())