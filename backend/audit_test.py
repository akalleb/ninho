import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

print("--- Início dos Testes de Integração Backend ---")

# 1. Obter profissionais básicos
print("GET /professionals/basic")
resp = requests.get(f"{BASE_URL}/professionals/basic")
print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    print(f"Total reais encontrados: {len(resp.json())}")

# 2. Criar um novo profissional
print("\nPOST /professionals/")
novo_prof = {
    "name": "Profissional Teste Auditoria",
    "email": "teste.auditoria.ninho@example.com",
    "cpf": "000.000.000-00",
    "role": "health",
    "employment_type": "effective",
    "password": "senha_segura_123"
}
resp_create = requests.post(f"{BASE_URL}/professionals/", json=novo_prof)
print(f"Status: {resp_create.status_code}")
prof_id = None
if resp_create.status_code == 200:
    data = resp_create.json()
    prof_id = data.get("id")
    print(f"Criado com sucesso. ID: {prof_id}")
else:
    print("Falha na criação:", resp_create.text)

# 3. Atualizar o profissional se criado
if prof_id:
    print(f"\nPUT /professionals/{prof_id}")
    update_data = novo_prof.copy()
    update_data["name"] = "Profissional Teste Editado"
    # O backend espera a senha para update tbm pq update_prof tem password
    update_data["password"] = "senha_segura_123" 
    
    resp_update = requests.put(f"{BASE_URL}/professionals/{prof_id}", json=update_data)
    print(f"Status: {resp_update.status_code}")
    if resp_update.status_code == 200:
         print("Atualizado com sucesso. Novo nome:", resp_update.json().get("name"))
    else:
         print("Falha na atualização:", resp_update.text)

    # 4. Deletar (Simular Force Delete)
    print(f"\nPOST /professionals/{prof_id}/force-delete (Deletando real)")
    # Force delete expects { "confirm": "email" }
    del_payload = {"confirm": "teste.auditoria.ninho@example.com"}
    resp_del = requests.post(f"{BASE_URL}/professionals/{prof_id}/force-delete", json=del_payload)
    print(f"Status: {resp_del.status_code}")
    if resp_del.status_code in [200, 204]:
         print("Deletado com sucesso do DB e Supabase Auth")
    else:
         print("Falha ao deletar:", resp_del.text)
else:
    print("\nPulo atualização e exclusão porque criação falhou (provavelmente já existe). Tentando buscar e limpar.")
    
# Testando Frontend
print("\n--- Início dos Testes Frontend ---")
print("GET http://localhost:3000/login")
try:
    resp_fe = requests.get("http://localhost:3000/login")
    print(f"Status: {resp_fe.status_code}")
    if "Ninho Social" in resp_fe.text:
        print("Frontend responde e contém 'Ninho Social'")
    else:
        print("Frontend respondeu mas conteúdo suspeito")
except Exception as e:
    print("Erro ao bater no frontend:", e)
    
print("Testes concluídos.")
