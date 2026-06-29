from fastapi.testclient import TestClient


def test_login_returns_token_for_admin(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin"})

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password."


def test_me_returns_current_admin(client: TestClient, admin_token: str) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    assert response.json() == {"username": "admin", "role": "admin"}
