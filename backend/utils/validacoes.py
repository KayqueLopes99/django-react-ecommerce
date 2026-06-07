import re

def valida_cpf(cpf):
    cpf = re.sub(r'[^0-9]', '', str(cpf))

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    soma_1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digito_1 = (soma_1 * 10 % 11) % 10

    soma_2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digito_2 = (soma_2 * 10 % 11) % 10

    return cpf[-2:] == f"{digito_1}{digito_2}"

import re

def valida_cep(cep):
    cep_limpo = re.sub(r'[^0-9]', '', str(cep))

    return len(cep_limpo) == 8