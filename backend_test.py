#!/usr/bin/env python3
"""
Backend API Test Suite for GymBuddy
Testing POST /api/meal-search endpoint
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8001"

def test_meal_search_happy_path():
    """
    TEST 1: Happy path - chicken biryani
    Verify HTTP 200 and full schema with all portion sizes
    """
    print("\n" + "="*70)
    print("TEST 1: Happy Path - Chicken Biryani")
    print("="*70)
    
    url = f"{BASE_URL}/api/meal-search"
    payload = {"query": "chicken biryani"}
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response JSON:\n{json.dumps(data, indent=2)}")
        
        # Validate schema
        required_keys = ["name", "cuisine", "description", "portions"]
        for key in required_keys:
            if key not in data:
                print(f"❌ FAIL: Missing key '{key}' in response")
                return False
        
        # Validate portions
        portions = data.get("portions", {})
        required_portions = ["small", "medium", "large"]
        for portion_key in required_portions:
            if portion_key not in portions:
                print(f"❌ FAIL: Missing portion '{portion_key}'")
                return False
            
            portion = portions[portion_key]
            required_fields = ["label", "grams", "calories", "protein_g", "carbs_g", "fats_g"]
            for field in required_fields:
                if field not in portion:
                    print(f"❌ FAIL: Missing field '{field}' in {portion_key} portion")
                    return False
        
        # Verify grams differ across portions (small < medium < large)
        small_grams = portions["small"]["grams"]
        medium_grams = portions["medium"]["grams"]
        large_grams = portions["large"]["grams"]
        
        print(f"\nPortion sizes (grams): Small={small_grams}, Medium={medium_grams}, Large={large_grams}")
        
        if not (small_grams < medium_grams < large_grams):
            print(f"❌ FAIL: Grams should increase: small < medium < large")
            return False
        
        print("✅ PASS: All schema fields present, portions valid, grams increase correctly")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meal_search_sushi():
    """
    TEST 2: Second query - sushi
    Verify cuisine is roughly "Japanese"
    """
    print("\n" + "="*70)
    print("TEST 2: Second Query - Sushi (Cuisine Check)")
    print("="*70)
    
    url = f"{BASE_URL}/api/meal-search"
    payload = {"query": "sushi"}
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAIL: Expected 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        print(f"Response JSON:\n{json.dumps(data, indent=2)}")
        
        cuisine = data.get("cuisine", "").lower()
        print(f"\nCuisine: {cuisine}")
        
        if "japan" not in cuisine:
            print(f"⚠️  WARNING: Expected cuisine to contain 'japan', got '{cuisine}'")
            # Still pass if it's close enough
            if cuisine in ["asian", "east asian"]:
                print("✅ PASS: Cuisine is acceptable (Asian)")
                return True
            else:
                print(f"❌ FAIL: Cuisine should be Japanese or Asian")
                return False
        
        print("✅ PASS: Cuisine is Japanese")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meal_search_empty_query():
    """
    TEST 3: Empty query
    Should return HTTP 400 with detail "query required"
    """
    print("\n" + "="*70)
    print("TEST 3: Empty Query - Validation Error")
    print("="*70)
    
    url = f"{BASE_URL}/api/meal-search"
    payload = {"query": ""}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 400:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
            return False
        
        data = response.json()
        detail = data.get("detail", "")
        
        if detail != "query required":
            print(f"❌ FAIL: Expected detail 'query required', got '{detail}'")
            return False
        
        print("✅ PASS: Empty query returns 400 with 'query required'")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meal_search_missing_body():
    """
    TEST 4: Missing body
    Should return HTTP 422 (validation error)
    """
    print("\n" + "="*70)
    print("TEST 4: Missing Body - Validation Error")
    print("="*70)
    
    url = f"{BASE_URL}/api/meal-search"
    
    try:
        # Send POST with no body
        response = requests.post(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 422:
            print(f"❌ FAIL: Expected 422, got {response.status_code}")
            return False
        
        print("✅ PASS: Missing body returns 422 validation error")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def test_meal_search_long_query():
    """
    TEST 5: Very long query (250+ chars)
    Should return HTTP 400 with detail "query too long"
    """
    print("\n" + "="*70)
    print("TEST 5: Very Long Query - Validation Error")
    print("="*70)
    
    url = f"{BASE_URL}/api/meal-search"
    # Create a 250+ character query
    long_query = "a" * 251
    payload = {"query": long_query}
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Query length: {len(long_query)} chars")
        print(f"Response: {response.text}")
        
        if response.status_code != 400:
            print(f"❌ FAIL: Expected 400, got {response.status_code}")
            return False
        
        data = response.json()
        detail = data.get("detail", "")
        
        if detail != "query too long":
            print(f"❌ FAIL: Expected detail 'query too long', got '{detail}'")
            return False
        
        print("✅ PASS: Long query returns 400 with 'query too long'")
        return True
        
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False


def main():
    print("\n" + "="*70)
    print("BACKEND API TEST SUITE - POST /api/meal-search")
    print("="*70)
    print(f"Base URL: {BASE_URL}")
    print(f"Testing 5 scenarios...")
    
    results = []
    
    # Run all tests
    results.append(("TEST 1: Happy Path (chicken biryani)", test_meal_search_happy_path()))
    results.append(("TEST 2: Second Query (sushi)", test_meal_search_sushi()))
    results.append(("TEST 3: Empty Query", test_meal_search_empty_query()))
    results.append(("TEST 4: Missing Body", test_meal_search_missing_body()))
    results.append(("TEST 5: Long Query", test_meal_search_long_query()))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {passed} passed, {failed} failed out of {len(results)} tests")
    
    if failed > 0:
        print("\n❌ SOME TESTS FAILED")
        sys.exit(1)
    else:
        print("\n✅ ALL TESTS PASSED")
        sys.exit(0)


if __name__ == "__main__":
    main()
