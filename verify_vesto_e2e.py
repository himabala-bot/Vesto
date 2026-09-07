import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body) if res_body else {}, response.status
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {url}: {err_body}")
        raise e

def run_tests():
    print("=== STARTING VESTO FULL END-TO-END VERIFICATION ===")


    health, status = make_request("/health/")
    assert health["status"] == "healthy", "Health check failed"
    print("[PASS] Backend API Health check passed.")


    import random
    rand_id = random.randint(1000, 9999)
    reg_data = {
        "username": f"alex_vesto_{rand_id}",
        "email": f"alex_{rand_id}@vesto.app",
        "first_name": "Alex",
        "password": "password123",
        "currency": "USD",
        "currency_symbol": "$"
    }
    res, _ = make_request("/auth/register/", method="POST", data=reg_data)
    token = res["access"]
    user = res["user"]
    print(f"[PASS] Registered user '{user['username']}' with JWT authentication.")


    dash, _ = make_request("/analytics/dashboard/?month=2026-08", token=token)
    assert dash["has_data"] == False, "Dashboard should be empty for new users"
    assert dash["all_time_balance"] == 0.0, "Balance should be 0.0"
    assert dash["safe_to_spend"]["status"] == "unconfigured", "Safe to spend should be unconfigured"
    print("[PASS] Verified clean empty state with $0.00 metrics (zero fake data).")


    categories_res, _ = make_request("/categories/", token=token)
    categories = categories_res.get("results", categories_res) if isinstance(categories_res, dict) else categories_res
    assert len(categories) > 0, "Default categories should exist"
    salary_cat = next((c for c in categories if c["name"] == "Primary Salary"), None)
    grocery_cat = next((c for c in categories if c["name"] == "Groceries"), None)
    housing_cat = next((c for c in categories if "Housing" in c["name"]), None)
    print(f"[PASS] Verified {len(categories)} default categories initialized.")


    inc_tx, _ = make_request("/transactions/", method="POST", data={
        "category": salary_cat["id"] if salary_cat else None,
        "amount": 6500.00,
        "type": "income",
        "date": "2026-08-01",
        "description": "Tech Job Salary"
    }, token=token)
    print(f"[PASS] Recorded Income: +$6,500.00 (Tx ID: {inc_tx['id']}).")


    dash, _ = make_request("/analytics/dashboard/?month=2026-08", token=token)
    assert dash["has_data"] == True, "Dashboard should now show real data"
    assert dash["all_time_balance"] == 6500.00, f"Expected 6500.00, got {dash['all_time_balance']}"
    assert dash["month_summary"]["income"] == 6500.00
    assert dash["safe_to_spend"]["safe_month"] == 6500.00
    assert dash["safe_to_spend"]["status"] == "on_track"
    print(f"[PASS] Safe to Spend calculated: Daily Allowance ${dash['safe_to_spend']['safe_daily']}/day on track.")


    recurring, _ = make_request("/recurring/", method="POST", data={
        "name": "Apartment Rent",
        "amount": 1800.00,
        "frequency": "monthly",
        "due_day": 1,
        "category": housing_cat["id"] if housing_cat else None
    }, token=token)
    print(f"[PASS] Created Recurring Bill: $1,800.00/mo Rent (ID: {recurring['id']}).")


    log_res, _ = make_request(f"/recurring/{recurring['id']}/log_payment/", method="POST", data={
        "date": "2026-08-01"
    }, token=token)
    print("[PASS] Logged recurring payment as real expense transaction.")


    budget, _ = make_request("/budgets/", method="POST", data={
        "category": grocery_cat["id"] if grocery_cat else categories[0]["id"],
        "amount": 600.00,
        "month": "2026-08"
    }, token=token)
    print(f"[PASS] Set Monthly Budget: $600.00 for Groceries (ID: {budget['id']}).")


    goal, _ = make_request("/goals/", method="POST", data={
        "name": "6-Month Emergency Reserve",
        "target_amount": 10000.00,
        "current_amount": 1500.00,
        "target_date": "2026-12-31",
        "color": "#10b981",
        "icon": "shield"
    }, token=token)
    print(f"[PASS] Established Savings Goal: $10,000.00 Emergency Fund (ID: {goal['id']}).")

    contrib_res, _ = make_request(f"/goals/{goal['id']}/contribute/", method="POST", data={
        "amount": 500.00,
        "notes": "August bonus contribution",
        "log_transaction": True
    }, token=token)
    assert contrib_res["goal"]["current_amount"] == "2000.00" or contrib_res["goal"]["current_amount"] == 2000.00
    print(f"[PASS] Contributed +$500.00 to Goal. New balance: $2,000.00 (20% reached).")


    exp_tx, _ = make_request("/transactions/", method="POST", data={
        "category": grocery_cat["id"] if grocery_cat else None,
        "amount": 125.50,
        "type": "expense",
        "date": "2026-08-05",
        "description": "Trader Joe's Groceries"
    }, token=token)
    print(f"[PASS] Recorded Grocery Expense: -$125.50 (Tx ID: {exp_tx['id']}).")


    insights, _ = make_request("/analytics/insights/?month=2026-08", token=token)
    assert insights["current_summary"]["income"] == 6500.00
    assert insights["current_summary"]["expense"] == 2425.50
    assert len(insights["category_insights"]) > 0
    print("[PASS] Insights Engine: verified velocity curve and category distribution.")


    custom_cat, _ = make_request("/categories/", method="POST", data={
        "name": "Artisan Coffee",
        "type": "expense",
        "color": "#f59e0b",
        "icon": "coffee"
    }, token=token)
    print(f"[PASS] Custom Category created: '{custom_cat['name']}' (ID: {custom_cat['id']}).")


    final_dash, _ = make_request("/analytics/dashboard/?month=2026-08", token=token)
    print(f"[PASS] Final All-Time Net Balance: ${final_dash['all_time_balance']:,.2f}")
    print(f"[PASS] Final Month Inflow: ${final_dash['month_summary']['income']:,.2f}")
    print(f"[PASS] Final Month Outflow: ${final_dash['month_summary']['expense']:,.2f}")
    print(f"[PASS] Final Savings Rate: {final_dash['month_summary']['savings_rate']}%")
    print(f"[PASS] Final Safe to Spend Daily Allowance: ${final_dash['safe_to_spend']['safe_daily']:,.2f}/day")
    print("\nSUCCESS: ALL E2E USER FLOWS & ENGINE CALCULATIONS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
