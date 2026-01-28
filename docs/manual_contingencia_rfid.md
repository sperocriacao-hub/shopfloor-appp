# Manual de Contingência - Sistema RFID Shopfloor

**Versão:** 1.0  
**Data:** 25/01/2026  
**Responsável:** Equipe de Engenharia de Processos

---

## 1. Visão Geral
Este documento descreve os procedimentos a serem adotados em caso de falha nos leitores RFID (Station Fixed Readers) ou nos crachás/tags (Asset Tags), garantindo a continuidade da produção.

## 2. Cenários de Falha e Ações

### 2.1 Leitor Fixo Offline (Tablet não reconhece Estação)
**Sintoma:** O Tablet não entra na tela da Estação ou mostra "Aguardando Leitor...".
**Ação Imediata:**
1.  Verifique se a luz verde do Leitor está acesa.
2.  Verifique o cabo de rede/PoE.
3.  **Contingência:** No Tablet, utilize a opção "Entrada Manual" (se habilitada) ou solicite ao Supervisor para logar com senha mestre.

### 2.2 Tag do Ativo Não Lida (Molde/Peça)
**Sintoma:** Ao aproximar o leitor de mão ou passar pelo portal, o sistema não bipa/registra.
**Ação Imediata:**
1.  Limpe a superfície da Tag.
2.  Tente ler com outro dispositivo (Scanner de Mão vs Portal).
3.  **Contingência:**
    - Identifique o ID visual gravado na etiqueta (Ex: `AST-MOLD-054`).
    - Digite este ID manualmente no campo de busca da Ordem de Produção.
    - Notifique a manutenção via menu **Admin > Hardware**.

### 2.3 Perda de Crachá (Operador)
**Sintoma:** Operador não consegue fazer Check-in.
**Ação:**
1.  O Líder de Linha deve desbloquear o tablet.
2.  Utilize o **Menu Admin > Gravador RFID** para associar um novo cartão provisório ao funcionário.

## 3. Ferramentas de Diagnóstico (Acesso Supervisor/TI)

Acesse a tela `/admin` para ferramentas avançadas:

-   **Provisioning Tab:** Verifique se o leitor está com status `Online`. Se `Offline` por > 10min, reinicie o switch PoE.
-   **Debugger:** Acompanhe em tempo real se os leitores estão enviando dados. Se houver dados no Debugger mas a tela de produção não reagir, o problema é no Frontend (Tablet), não no Leitor.
-   **Simulador:** Utilize para testar se a lógica do sistema está funcionando, simulando uma leitura de tag válida.

## 4. Matriz de Escalabilidade

| Nível | Tempo de Parada | Quem Acionar |
| :--- | :--- | :--- |
| 1 | < 5 min | Líder de Linha (Uso de Senha Manual) |
| 2 | > 15 min | Manutenção TI (Troca de Leitor/Cabo) |
| 3 | Crítico (Linha Parada) | Gerente de Produção + Engenharia |

---
*Em caso de dúvida, consulte o canal #suporte-shopfloor.*
