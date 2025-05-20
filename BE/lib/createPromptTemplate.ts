// promptTemplates.ts
export async function createPromptTemplate(
    context: string,
    query: string,
    userName: string = "användare",
    income: number | null = null,
    provider: string = 'openai',
    modelName: string = ''
  ): Promise<string> {
    
    // Basversion av prompten
    let prompt = `
  Du är en hjälpsam AI-assistent som svarar på svenska. Använd informationen nedan för att svara på frågan.
  Ditt namn är BOSTR-bot och du pratar med användaren ${userName}.`;
  
    // Lägg till inkomstinformation om den finns
    if (income !== null) {
      prompt += `\nAnvändarens inkomst är ${income} kronor.`;
    }
  
    // Specifik instruktion för Mistral
    if (provider === 'ollama' && modelName.includes('mistral')) {
      prompt += `
  VIKTIGT: Om frågan handlar om "fribelopp", så är fribeloppet EXAKT 10 gånger användarens inkomst.
  Exempel: Om användarens inkomst är ${income} kronor, då är fribeloppet EXAKT ${income ? income * 10 : 'inkomst * 10'} kronor.
  Du får INTE använda någon annan definition av fribelopp än detta!
  `;
    } else {
      // Standard instruktion för andra modeller
      prompt += `
  Om användaren frågar efter fribeloppet kommer du kunna svara att fribeloppet är för den här användaren är 10 gånger ${income}
  `;
    }
  
    // Resten av prompten
    prompt += `
  Här är information som du kan använda:
  ${context}
  
  Fråga från ${userName}: ${query}
  
  Om frågan gäller "fribelopp" men inget årtal anges, fråga användaren vilket år (t.ex. 2024 eller 2025) det gäller.
  Svara annars koncist och direkt på svenska. Var vänlig och personlig i ditt svar genom att använda användarens namn (${userName}) ibland.
  
  Om informationen för att besvara frågan inte finns i texten ovan,
  säg bara "Jag hittar ingen information om det i de tillgängliga dokumenten, ${userName}."
  
  Avsluta gärna ditt svar på ett personligt sätt, t.ex. "Hoppas det hjälper dig, ${userName}!" om det passar i sammanhanget.
  `;
  
    return prompt;
  }
  
  // Du kan lägga till fler modellspecifika promptmallar här om det behövs
  export async function createMistralPrompt(
    context: string,
    query: string,
    userName: string,
    income: number | null
  ): Promise<string> {
    // Specialiserad prompt för Mistral om du vill ha ännu mer kontroll
    return `
  DU ÄR BOSTR-BOT OCH FÖLJER DESSA INSTRUKTIONER EXAKT.
  Du pratar med användaren ${userName}.
  Användarens inkomst är ${income} kronor.
  
  FRIBELOPP ÄR ALLTID EXAKT 10 GÅNGER ANVÄNDARENS INKOMST (${income ? income * 10 : 'inkomst * 10'} kronor).
  
  Här är information som du kan använda:
  ${context}
  
  Fråga från ${userName}: ${query}
  
  Svara koncist och direkt på svenska. Var vänlig och personlig i ditt svar.
  `;
  }

 // Importera först funktionen högst upp i filen
export async function createLlama2Prompt(
    context: string,
    query: string,
    userName: string,
    income: number | null
  ): Promise<string> {
    // Llama 2 fungerar bra med tydliga instruktioner
    let prompt = `[INST] <<SYS>>
  Du är BOSTR-bot, en hjälpsam AI-assistent som svarar på svenska.
  Du ger konkreta och korrekta svar baserade på given information.
  `;
  
    // Lägg till inkomstinformation om den finns
    if (income !== null) {
      prompt += `
  Användarens namn är ${userName}.
  Användarens inkomst är ${income} kronor.
  
  VIKTIGT: FRIBELOPP ÄR ALLTID EXAKT 10 × INKOMST.
  Om du får en fråga om fribelopp, beräkna det som exakt 10 × ${income} = ${income * 10} kronor.
  `;
    }
  
    // Fortsätt prompten
    prompt += `
  När du svarar, var vänlig, koncis och använd ett personligt tilltal med användarens namn (${userName}).
  <</SYS>>
  
  Jag behöver svar på följande fråga baserat på informationen nedan:
  
  INFORMATION:
  ${context}
  
  FRÅGA:
  ${query}
  [/INST]`;
  
    return prompt;
  } 