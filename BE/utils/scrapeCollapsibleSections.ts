import * as cheerio from 'cheerio';

interface Doc {
    pageContent: string;
    metadata: Record<string, any>;
}


export function scrapeCollapsibleSections(html: string, sourceUrl: string): Doc[] {
    const $ = cheerio.load(html);
    const docs: Doc[] = [];
    const pageTitle = $('title').first().text().trim() || 'Okänd titel'; // För metadata

    
    $('div.sv-collapsible-content').each((index, element) => {
        const collapsibleWrapper = $(element);

       
        const headerElement = collapsibleWrapper.find('h3').first(); // .first() om det skulle finnas fler

       
        const contentElement = headerElement.next('div');

        const question = headerElement.text().trim();
       
        const answer = contentElement.text().trim().replace(/\s+/g, ' ');

        if (question && answer) {
            docs.push({
              
                pageContent: `Rubrik: ${question}\n\nInnehåll:\n${answer}`,
                metadata: {
                    source: sourceUrl,
                    title: pageTitle,        
                    section: question,      
                    type: 'csn-collapsible-section', 
                    scraped: new Date().toISOString()
                }
            });
        } else {
            
            console.warn(`Kunde inte extrahera rubrik/innehåll från element ${index+1} på ${sourceUrl}. Rubrik: "${question}", Innehåll hittat: ${!!answer}`);
        }
    });

    return docs;
}
