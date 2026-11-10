import urllib.request
import urllib.parse
import http.cookiejar
import json
import random
import time
import sys

BASE = 'http://localhost:3000'
results = []

def test(name, condition, extra=''):
    if condition:
        print(f" PASS: {name} {extra}")
        results.append(True)
    else:
        print(f" FAIL: {name} {extra}")
        results.append(False)

print("=" * 70)
print("RUDHIRAM SYSTEM VERIFICATION & SECURITY TEST SUITE")
print("=" * 70)

# ==============================================================================
# SECTION 1: PUBLIC PAGES ACCESSIBILITY & BRANDING
# ==============================================================================
print("\n--- 1. Testing Public Pages & Institutional Branding ---")

public_routes = [
    '/',
    '/about',
    '/how-it-works',
    '/register',
    '/request',
    '/contact',
    '/privacy',
    '/admin/login',
]

for route in public_routes:
    try:
        res = urllib.request.urlopen(f"{BASE}{route}", timeout=5)
        test(f"Page Access: {route}", res.status == 200, f"(HTTP {res.status})")
    except Exception as e:
        test(f"Page Access: {route}", False, str(e))

try:
    html = urllib.request.urlopen(f"{BASE}/", timeout=5).read().decode('utf-8')
    test("Identity Check: Portal Name RUDHIRAM present", "RUDHIRAM" in html)
    test("Identity Check: Official Tagline present", "RESPOND. REGISTER. DONATE" in html)
    test("Identity Check: Christ College Irinjalakuda present", "Christ College (Autonomous), Irinjalakuda" in html)
    test("Identity Check: NSS Units 20 & 49 present", "NSS Units 20" in html)
    test("Identity Check: University of Calicut present", "University of Calicut" in html)
except Exception as e:
    test("Identity Check", False, str(e))

# ==============================================================================
# SECTION 2: STRICT PRIVACY & ZERO PUBLIC EXPOSURE TESTING
# ==============================================================================
print("\n--- 2. Testing Strict Security & Anonymous Access Protection ---")

protected_apis = [
    '/api/donors',
    '/api/requests',
    '/api/stats',
    '/api/logs',
    '/api/match?blood_group=O%2B',
    '/api/export?type=donors',
]

for api in protected_apis:
    try:
        urllib.request.urlopen(f"{BASE}{api}", timeout=5)
        test(f"Security: Anonymous {api} blocked", False, "VIOLATION: Anonymous access was allowed!")
    except urllib.error.HTTPError as err:
        test(f"Security: Anonymous {api} blocked (401)", err.code == 401, f"(Blocked with HTTP {err.code})")
    except Exception as e:
        test(f"Security: Anonymous {api} blocked", False, str(e))

# Test Middleware route protection on /admin/dashboard
try:
    req = urllib.request.Request(f"{BASE}/admin/dashboard", headers={'User-Agent': 'Mozilla/5.0'})
    res = urllib.request.urlopen(req, timeout=5)
    test("Security: /admin/dashboard redirects to /admin/login", "/admin/login" in res.geturl(), f"Redirect: {res.geturl()}")
except Exception as e:
    test("Security: /admin/dashboard route guard", False, str(e))

# ==============================================================================
# SECTION 3: FORM VALIDATION TESTING (PUBLIC)
# ==============================================================================
print("\n--- 3. Testing Public Form Submission & Input Validation ---")

def post_json(path, data):
    time.sleep(1.0)
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    return urllib.request.urlopen(req, timeout=5)

# Underage donor (< 18)
try:
    post_json('/api/donors', {
        'full_name': 'Young User',
        'age': 16,
        'blood_group': 'O+',
        'mobile': '9847123456',
        'district': 'Thrissur',
        'locality': 'Irinjalakuda',
        'pincode': '680121',
        'consent': True
    })
    test("Validation: Underage donor rejected (<18)", False)
except urllib.error.HTTPError as err:
    body = err.read().decode('utf-8')
    test("Validation: Underage donor rejected (<18)", err.code == 400 and "18 years" in body, f"(HTTP {err.code})")

# Invalid phone format
try:
    post_json('/api/donors', {
        'full_name': 'Test User',
        'age': 20,
        'blood_group': 'O+',
        'mobile': '12345',
        'district': 'Thrissur',
        'locality': 'Irinjalakuda',
        'pincode': '680121',
        'consent': True
    })
    test("Validation: Invalid mobile number rejected", False)
except urllib.error.HTTPError as err:
    body = err.read().decode('utf-8')
    test("Validation: Invalid mobile number rejected", err.code == 400 and "10-digit" in body, f"(HTTP {err.code})")

# Missing consent
try:
    post_json('/api/donors', {
        'full_name': 'Test User',
        'age': 20,
        'blood_group': 'O+',
        'mobile': '9847111222',
        'district': 'Thrissur',
        'locality': 'Irinjalakuda',
        'pincode': '680121',
        'consent': False
    })
    test("Validation: Missing voluntary consent rejected", False)
except urllib.error.HTTPError as err:
    body = err.read().decode('utf-8')
    test("Validation: Missing voluntary consent rejected", err.code == 400 and "consent" in body, f"(HTTP {err.code})")

# Valid Donor Registrations (Real user registrations)
random_digits1 = random.randint(100000, 999999)
donor1_phone = f"9847{random_digits1}"
try:
    res = post_json('/api/donors', {
        'full_name': 'Sidharth R. Menon',
        'age': 21,
        'gender': 'Male',
        'blood_group': 'A+',
        'mobile': donor1_phone,
        'email': 'sidharth.menon@christcollegeijk.edu.in',
        'district': 'Thrissur',
        'locality': 'Irinjalakuda Town',
        'pincode': '680121',
        'availability': 'Available',
        'additional_information': 'NSS Unit 20 executive committee volunteer',
        'consent': True
    })
    res_data = json.loads(res.read().decode('utf-8'))
    registered_donor_id = res_data.get('registrationId')
    test("Operation: Valid donor registration accepted (A+)", res.status == 200 and res_data.get('success') is True, f"(Reg ID: {registered_donor_id})")
except Exception as e:
    test("Operation: Valid donor registration accepted (A+)", False, str(e))

random_digits2 = random.randint(100000, 999999)
donor2_phone = f"9745{random_digits2}"
try:
    res = post_json('/api/donors', {
        'full_name': 'Devika Nair',
        'age': 22,
        'gender': 'Female',
        'blood_group': 'O+',
        'mobile': donor2_phone,
        'email': 'devika.nair@christcollegeijk.edu.in',
        'district': 'Thrissur',
        'locality': 'Irinjalakuda North',
        'pincode': '680125',
        'availability': 'Available',
        'additional_information': 'NSS Unit 49 volunteer',
        'consent': True
    })
    res_data = json.loads(res.read().decode('utf-8'))
    test("Operation: Valid donor registration accepted (O+)", res.status == 200 and res_data.get('success') is True, f"(Reg ID: {res_data.get('registrationId')})")
except Exception as e:
    test("Operation: Valid donor registration accepted (O+)", False, str(e))

# Valid Blood Request
new_req_phone = f"9745{random.randint(100000, 999999)}"
created_request_id = None
try:
    res = post_json('/api/requests', {
        'patient_name': 'Valsala Kumari',
        'contact_person': 'Vinod (Son)',
        'contact_number': new_req_phone,
        'blood_group': 'O-',
        'units_required': 2,
        'hospital_name': 'Taluk Headquarters Hospital',
        'hospital_location': 'Irinjalakuda',
        'district': 'Thrissur',
        'required_date': '2026-11-25',
        'urgency': 'Emergency',
        'additional_information': 'Emergency ICU trauma case'
    })
    res_data = json.loads(res.read().decode('utf-8'))
    created_request_id = res_data.get('requestId')
    test("Operation: Valid blood request accepted", res.status == 200 and res_data.get('success') is True, f"(Req ID: {created_request_id})")
except Exception as e:
    test("Operation: Valid blood request accepted", False, str(e))

# ==============================================================================
# SECTION 4: ADMINISTRATOR AUTHENTICATION & SESSION MANAGEMENT
# ==============================================================================
print("\n--- 4. Testing Administrator Authentication & Session Lifecycle ---")

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# Invalid password check
try:
    req = urllib.request.Request(
        f"{BASE}/api/auth/login",
        data=json.dumps({'email': 'admin@christcollegeijk.edu.in', 'password': 'WrongPassword123'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    opener.open(req)
    test("Security: Invalid admin password rejected", False)
except urllib.error.HTTPError as err:
    test("Security: Invalid admin password rejected (401)", err.code == 401, f"(HTTP {err.code})")

# Valid Admin Login
logged_in = False
try:
    req = urllib.request.Request(
        f"{BASE}/api/auth/login",
        data=json.dumps({'email': 'admin@christcollegeijk.edu.in', 'password': 'NSSChrist#2026'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = opener.open(req)
    res_data = json.loads(res.read().decode('utf-8'))
    logged_in = res.status == 200 and res_data.get('success') is True
    test("Auth: Administrator login succeeds", logged_in, f"User: {res_data.get('user', {}).get('name')}")
except Exception as e:
    test("Auth: Administrator login succeeds", False, str(e))

# Verify session endpoint
try:
    res = opener.open(f"{BASE}/api/auth/session")
    session_data = json.loads(res.read().decode('utf-8'))
    test("Auth: Session verified as superadmin", session_data.get('authenticated') is True and session_data.get('user', {}).get('role') == 'superadmin')
except Exception as e:
    test("Auth: Session verification", False, str(e))

# ==============================================================================
# SECTION 5: ADMINISTRATOR BACKEND OPERATIONS
# ==============================================================================
print("\n--- 5. Testing Administrator Dashboard & Database Operations ---")

# Database Statistics
try:
    res = opener.open(f"{BASE}/api/stats")
    stats_data = json.loads(res.read().decode('utf-8')).get('data', {})
    test("Database: Calculated statistics retrieved", stats_data.get('totalDonors', 0) > 0, f"Total Donors: {stats_data.get('totalDonors')}, Requests: {stats_data.get('totalRequests')}")
except Exception as e:
    test("Database: Calculated statistics", False, str(e))

# Donor Management: Search & Filter
try:
    res = opener.open(f"{BASE}/api/donors?blood_group=A%2B")
    donors_data = json.loads(res.read().decode('utf-8')).get('data', [])
    test("Donors: Filter by blood group A+", len(donors_data) > 0 and all(d['blood_group'] == 'A+' for d in donors_data), f"(Count: {len(donors_data)})")
except Exception as e:
    test("Donors: Filter by blood group A+", False, str(e))

# Blood Requests Management: Search & Status Update
try:
    res = opener.open(f"{BASE}/api/requests")
    requests_data = json.loads(res.read().decode('utf-8')).get('data', [])
    test("Requests: All requests retrieved for admin", len(requests_data) > 0, f"(Count: {len(requests_data)})")

    # Update status of newly created request to 'Under Review'
    if created_request_id:
        req = urllib.request.Request(
            f"{BASE}/api/requests/{created_request_id}",
            data=json.dumps({'status': 'Under Review'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='PATCH'
        )
        res_patch = opener.open(req)
        test("Requests: Status update persists to 'Under Review'", res_patch.status == 200)
except Exception as e:
    test("Requests: Management operations", False, str(e))

# Smart Donor Matching
try:
    res = opener.open(f"{BASE}/api/match?blood_group=O%2B&district=Thrissur")
    match_data = json.loads(res.read().decode('utf-8')).get('data', {})
    test("Matching: Smart donor matching returns compatible donors", len(match_data.get('exactMatches', [])) > 0, f"Exact: {len(match_data.get('exactMatches', []))}, Compatible: {len(match_data.get('compatibleMatches', []))}")
except Exception as e:
    test("Matching: Smart donor matching", False, str(e))

# CSV Export
try:
    res = opener.open(f"{BASE}/api/export?type=donors")
    content_type = res.headers.get('Content-Type')
    csv_text = res.read().decode('utf-8')
    test("Export: Donors CSV export generated with text/csv header", "text/csv" in content_type and "Full Name" in csv_text and "Blood Group" in csv_text, f"(CSV size: {len(csv_text)} bytes)")
except Exception as e:
    test("Export: Donors CSV export", False, str(e))

# Activity Logs
try:
    res = opener.open(f"{BASE}/api/logs")
    logs_data = json.loads(res.read().decode('utf-8')).get('data', [])
    test("Audit Logs: Activity trail populated with admin actions", len(logs_data) > 0, f"Total log entries: {len(logs_data)}")
except Exception as e:
    test("Audit Logs: Activity trail", False, str(e))

# ==============================================================================
# SECTION 6: ROLE-BASED ACCESS CONTROL (VIEW-ONLY ADMIN & ADMIN MANAGEMENT)
# ==============================================================================
print("\n--- 6. Testing RBAC: View-Only Observer & Admin Account Management ---")

# 6.1 Test Admin Management under Superadmin
try:
    # List admins
    res = opener.open(f"{BASE}/api/admins")
    admins_data = json.loads(res.read().decode('utf-8')).get('data', [])
    test("RBAC: Superadmin can view administrator accounts", len(admins_data) >= 3, f"(Found {len(admins_data)} admins)")

    # Create a new Coordinator admin
    new_admin_payload = json.dumps({
        'name': 'Prof. Arun Thomas',
        'email': 'arun.thomas@christcollegeijk.edu.in',
        'password': 'NSSArun#2026',
        'role': 'coordinator',
        'nss_unit': 'NSS Unit 20'
    }).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE}/api/admins",
        data=new_admin_payload,
        headers={'Content-Type': 'application/json'}
    )
    res_create = opener.open(req)
    create_data = json.loads(res_create.read().decode('utf-8'))
    created_admin_id = create_data.get('data', {}).get('id')
    test("RBAC: Superadmin can create new administrator account", res_create.status == 201 and created_admin_id is not None, f"Admin ID: {created_admin_id}")

    # Delete the newly created test admin
    if created_admin_id:
        req = urllib.request.Request(
            f"{BASE}/api/admins?id={created_admin_id}",
            method='DELETE'
        )
        res_del = opener.open(req)
        test("RBAC: Superadmin can delete/revoke admin account", res_del.status == 200)
except Exception as e:
    test("RBAC: Superadmin admin management", False, str(e))

# 6.2 Test View-Only Observer Login & Enforcement
viewer_cj = http.cookiejar.CookieJar()
viewer_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(viewer_cj))

try:
    login_payload = json.dumps({
        'email': 'viewer@christcollegeijk.edu.in',
        'password': 'Rudhiram#View2026'
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE}/api/auth/login", data=login_payload, headers={'Content-Type': 'application/json'})
    res = viewer_opener.open(req)
    v_data = json.loads(res.read().decode('utf-8'))
    test("Viewer: View-Only Observer login succeeds", res.status == 200 and v_data.get('user', {}).get('role') == 'viewer', f"Role: {v_data.get('user', {}).get('role')}")

    # View donors (Allowed)
    res_v_donors = viewer_opener.open(f"{BASE}/api/donors")
    test("Viewer: Can read confidential donor registry", res_v_donors.status == 200)

    # View requests (Allowed)
    res_v_requests = viewer_opener.open(f"{BASE}/api/requests")
    test("Viewer: Can read confidential blood requests", res_v_requests.status == 200)

    # Attempt to edit request status (Must be 403 Forbidden)
    if created_request_id:
        try:
            req = urllib.request.Request(
                f"{BASE}/api/requests/{created_request_id}",
                data=json.dumps({'status': 'Completed'}).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='PATCH'
            )
            viewer_opener.open(req)
            test("Viewer Security: Edit request blocked (403)", False, "Viewer was able to edit!")
        except urllib.error.HTTPError as err:
            test("Viewer Security: Edit request blocked with 403 Forbidden", err.code == 403, f"(HTTP {err.code})")

    # Attempt to delete request (Must be 403 Forbidden)
    if created_request_id:
        try:
            req = urllib.request.Request(
                f"{BASE}/api/requests/{created_request_id}",
                method='DELETE'
            )
            viewer_opener.open(req)
            test("Viewer Security: Delete request blocked (403)", False, "Viewer was able to delete!")
        except urllib.error.HTTPError as err:
            test("Viewer Security: Delete request blocked with 403 Forbidden", err.code == 403, f"(HTTP {err.code})")

    # Attempt to add new admin (Must be 403 Forbidden)
    try:
        req = urllib.request.Request(
            f"{BASE}/api/admins",
            data=json.dumps({'name': 'Test', 'email': 't@c.edu', 'password': '123', 'role': 'viewer'}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        viewer_opener.open(req)
        test("Viewer Security: Add admin blocked (403)", False, "Viewer was able to add admin!")
    except urllib.error.HTTPError as err:
        test("Viewer Security: Add admin blocked with 403 Forbidden", err.code == 403, f"(HTTP {err.code})")

except Exception as e:
    test("Viewer: View-Only test flow", False, str(e))

# Administrator Logout
try:
    req = urllib.request.Request(f"{BASE}/api/auth/logout", data=b'{}', headers={'Content-Type': 'application/json'})
    res = opener.open(req)
    test("Auth: Superadmin logout successfully clears session", res.status == 200)

    # Verify session is dead
    try:
        opener.open(f"{BASE}/api/donors")
        test("Security: Post-logout access rejected", False, "Session still active!")
    except urllib.error.HTTPError as err:
        test("Security: Post-logout access rejected (401)", err.code == 401, f"(HTTP {err.code})")
except Exception as e:
    test("Auth: Logout", False, str(e))

print("\n" + "=" * 70)
total_tests = len(results)
passed_tests = sum(results)
print(f"TEST SUITE COMPLETE: {passed_tests}/{total_tests} Tests Passed ({passed_tests/total_tests*100:.1f}%)")
print("=" * 70)

if passed_tests == total_tests:
    print("ALL TESTS PASSED! APPLICATION IS VERIFIED AND DEPLOYMENT READY.")
    sys.exit(0)
else:
    print(f"WARNING: {total_tests - passed_tests} test(s) failed.")
    sys.exit(1)
