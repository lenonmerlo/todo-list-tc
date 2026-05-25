# tasks/integrations.py
import requests


def fetch_address_by_cep(cep: str) -> dict:
    cep = cep.replace('-', '').strip()
    response = requests.get(f'https://viacep.com.br/ws/{cep}/json/')
    response.raise_for_status()
    data = response.json()
    if 'erro' in data:
        raise ValueError(f'CEP {cep} não encontrado.')
    return data