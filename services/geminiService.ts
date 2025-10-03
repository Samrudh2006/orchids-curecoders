import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { AgentName, AgentResultData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using mock data. Please set the API_KEY environment variable.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

let chatSession: Chat | null = null;

// Custom error for better feedback
class AgentError extends Error {
    suggestion?: string;
    constructor(message: string, suggestion?: string) {
        super(message);
        this.name = 'AgentError';
        this.suggestion = suggestion;
    }
}

const MOCK_DELAY = 1000;

const mockDecomposition = (prompt: string): Promise<AgentName[]> => {
    console.log("Using mock decomposition for prompt:", prompt);
    return new Promise(resolve => {
        setTimeout(() => {
            const agents = [
                AgentName.MARKET_DATA,
                AgentName.PATENTS,
                AgentName.CLINICAL,
                AgentName.WEB,
                AgentName.EXIM,
            ];
            resolve(agents);
        }, MOCK_DELAY);
    });
};

const mockGenerateAgentData = (agentName: AgentName, prompt: string, fileContext?: string): Promise<AgentResultData> => {
    console.log(`Using mock data for agent: ${agentName}`);
    return new Promise(resolve => {
        setTimeout(() => {
            let data: AgentResultData = {};
            switch(agentName) {
                case AgentName.MARKET_DATA:
                    data = { [AgentName.MARKET_DATA]: { 
                        therapy: "Obesity", 
                        molecule: "GLP-1 Agonist", 
                        marketSizeUSD: "90B", 
                        cagr: "12.5%", 
                        topCompetitors: [{name: "Novo Nordisk", share: "55%"}, {name: "Eli Lilly", share: "38%"}, {name: "Amgen", share: "3%"}, {name: "Other", share: "4%"}], 
                        insights: "Market dominated by two key players, but new entrants are targeting novel mechanisms.",
                        marketGrowth: [
                            { year: 2021, sizeB: 65 },
                            { year: 2022, sizeB: 74 },
                            { year: 2023, sizeB: 82 },
                            { year: 2024, sizeB: 90 },
                        ]
                    } };
                    break;
                case AgentName.PATENTS:
                    data = { [AgentName.PATENTS]: { patents: [
                        {title: "Oral delivery system for incretin-based", url: "#", expiryDate: "2041-07-01", owner: "Innovate MedTech", ftRisk: "High" },
                        {title: "Method of treating obesity with GLP-1", url: "#", expiryDate: "2035-08-22", owner: "Global Pharma", ftRisk: "Medium" }, 
                        {title: "Novel long-acting GLP-1 receptor agonist", url: "#", expiryDate: "2043-11-15", owner: "Global Pharma Inc.", ftRisk: "Low"},
                        {title: "Combination therapy of GLP-1 & amylin analogue", url: "#", expiryDate: "2045-03-20", owner: "BioGenix Therapeutics", ftRisk: "Low" }
                    ] } };
                    break;
                case AgentName.CLINICAL:
                    data = { [AgentName.CLINICAL]: { trials: [
                        {id: "NCT05001234", title: "Safety & Efficacy of AGP-101 in Adults with Obesity", phase: "1/2a", status: "Recruiting", sponsor: "Agility Pharma"}, 
                        {id: "NCT05005678", title: "Efficacy & Safety of AGP-101 vs Placebo", phase: "2b", status: "Active, not recruiting", sponsor: "Agility Pharma"},
                        {id: "NCT05009012", title: "Long-Term Efficacy & Cardiovascular Safety", phase: "3", status: "Planned", sponsor: "Agility Pharma"}
                    ] } };
                    break;
                case AgentName.WEB:
                     data = { [AgentName.WEB]: { webSignals: [
                        {title: "New study highlights cardiovascular benefits of GLP-1 agonists", url: "#", source: "CardioMetabolic Journal", excerpt: "A recent meta-analysis confirms significant cardiovascular risk reduction...", sentiment: 0.9},
                        {title: "Competitor announces promising results for novel oral GLP-1", url: "#", source: "BioPharma Dive", excerpt: "Innovate MedTech's latest trial data shows competitive efficacy...", sentiment: 0.5},
                        {title: "Regulatory concerns raised over long-term side effects", url: "#", source: "Regulatory Affairs Pro", excerpt: "Health authorities are requesting additional post-market surveillance data...", sentiment: 0.2}
                    ] } };
                    break;
                case AgentName.EXIM:
                    data = { [AgentName.EXIM]: { apiName: "Semaglutide", exportVolumes: [{ country: "Denmark", value: "USD 8B"}, {country: "USA", value: "USD 2B"}], importDependency: "Low", topSourcingCountries: [{ country: "Denmark", share: "85%"}]} };
                    break;
                case AgentName.INTERNAL:
                     data = { [AgentName.INTERNAL]: { summary: ["Q3 internal report highlights GLP-1 as a high-priority candidate for the metabolic diseases pipeline.", "R&D division has allocated preliminary budget for pre-clinical models.", fileContext || "No file context provided."] } };
                    break;
                default:
                    data = { raw: `Mock data for ${agentName} related to prompt: ${prompt}` };
            }
            resolve(data);
        }, MOCK_DELAY + Math.random() * 1500);
    });
};

const mockSynthesizeResults = (results: any, prompt: string): Promise<string> => {
    console.log("Using mock synthesis for results:", results);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`**Executive Summary for ${prompt}:** Based on the analysis, GLP-1 agonists for obesity represent a significant and rapidly growing market, currently dominated by Novo Nordisk and Eli Lilly. The patent landscape indicates opportunities for novel formulations, although key patents remain active. Clinical trial activity is high, focusing on next-generation therapies with improved efficacy and new delivery mechanisms. Web intelligence suggests strong positive sentiment tied to cardiovascular benefits, reinforcing market potential. Supply chain analysis shows a concentration in sourcing from Denmark, a potential risk factor to monitor.`);
        }, MOCK_DELAY);
    });
}

const getJsonFromResponse = (response: GenerateContentResponse): any => {
    try {
        const text = response.text.replace(/```json|```/g, "").trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini response:", e);
        console.error("Raw text:", response.text);
        throw new Error("Invalid JSON response from model.");
    }
}

export const decomposePrompt = async (prompt: string, fileUploaded: boolean): Promise<AgentName[]> => {
    if (!ai) return mockDecomposition(prompt);

    const availableAgents = Object.values(AgentName).filter(a => 
        a !== AgentName.DECOMPOSITION && 
        a !== AgentName.SYNTHESIS &&
        a !== AgentName.REPORT_GENERATOR
    );
    if (!fileUploaded) {
        const internalAgentIndex = availableAgents.indexOf(AgentName.INTERNAL);
        if (internalAgentIndex > -1) {
            availableAgents.splice(internalAgentIndex, 1);
        }
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            agents: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING,
                    enum: availableAgents,
                },
                description: 'List of agent names required to answer the user prompt.'
            }
        },
        required: ['agents']
    };

    const generationPrompt = `Based on the following user prompt, identify which of the available agents are necessary to formulate a comprehensive response. 
    Only select from this list of available agents: ${availableAgents.join(', ')}.
    Prompt: "${prompt}"
    ${fileUploaded ? "Context: An internal document has also been uploaded by the user. If relevant, you should use the 'Internal Documents' agent to analyze it." : ""}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const json = getJsonFromResponse(response);
        return json.agents as AgentName[];
    } catch (error) {
        console.error("Error in decomposePrompt:", error);
        throw new AgentError(
            "The Master Agent failed to understand the prompt.",
            "Please try rephrasing your query to be more specific about the drug, therapy area, or type of analysis you need."
        );
    }
};

export const generateAgentData = async (agentName: AgentName, prompt: string, fileContext?: string): Promise<AgentResultData> => {
    if (!ai) return mockGenerateAgentData(agentName, prompt, fileContext);
    
    try {
        let schema: any;
        let generationPrompt: string;
        
        switch (agentName) {
            case AgentName.MARKET_DATA:
                schema = {
                    type: Type.OBJECT, properties: { [AgentName.MARKET_DATA]: { type: Type.OBJECT, properties: { therapy: { type: Type.STRING }, molecule: { type: Type.STRING }, marketSizeUSD: { type: Type.STRING }, cagr: { type: Type.STRING }, topCompetitors: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, share: { type: Type.STRING } } } }, insights: { type: Type.STRING }, marketGrowth: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, sizeB: { type: Type.NUMBER } } } } }}}
                };
                generationPrompt = `Generate mock IQVIA market data for the molecule/therapy mentioned in this prompt: "${prompt}". Respond with realistic but fictional data, including at least 3-4 competitors and 4 years of market growth data.`;
                break;
            case AgentName.PATENTS:
                schema = {
                    type: Type.OBJECT, properties: { [AgentName.PATENTS]: { type: Type.OBJECT, properties: { patents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, expiryDate: { type: Type.STRING }, owner: { type: Type.STRING }, ftRisk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] } } } }}}}
                };
                generationPrompt = `Generate a list of 1-4 mock patents related to the prompt: "${prompt}". Include realistic but fictional details. URLs can be "#". Ensure a mix of Low, Medium, and High ftRisk.`;
                break;
            case AgentName.CLINICAL:
                schema = {
                    type: Type.OBJECT, properties: { [AgentName.CLINICAL]: { type: Type.OBJECT, properties: { trials: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, phase: { type: Type.STRING }, status: { type: Type.STRING }, sponsor: { type: Type.STRING } } } }}}}
                };
                generationPrompt = `Generate a list of 1-3 mock clinical trials for the molecule/therapy in prompt: "${prompt}". Use fictional NCT IDs.`;
                break;
            case AgentName.EXIM:
                schema = {
                    type: Type.OBJECT, properties: { [AgentName.EXIM]: { type: Type.OBJECT, properties: { apiName: { type: Type.STRING }, exportVolumes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, value: { type: Type.STRING } } } }, importDependency: { type: Type.STRING }, topSourcingCountries: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { country: { type: Type.STRING }, share: { type: Type.STRING } } } }}}}
                };
                generationPrompt = `Generate mock EXIM trade data for the API/molecule from the prompt: "${prompt}". Create realistic but fictional data.`;
                break;
            case AgentName.INTERNAL:
                if (!fileContext) return { [AgentName.INTERNAL]: { summary: ["No file was provided for analysis."] }};
                schema = {
                    type: Type.OBJECT, properties: { [AgentName.INTERNAL]: { type: Type.OBJECT, properties: { summary: { type: Type.ARRAY, items: { type: Type.STRING }}}}}
                };
                generationPrompt = `The user prompt is: "${prompt}". As context, they have uploaded an internal document with the following details: ${fileContext}. Synthesize a few key takeaways from this document as they relate to the user's prompt. Generate a list of 2-3 bullet points.`;
                break;
            default: // WEB agent
                 generationPrompt = `Generate 3 mock web intelligence signals for the prompt: "${prompt}". For each, provide a title, source, excerpt, url (#), and a sentiment score between 0.0 and 1.0.`;
                 schema = {
                    type: Type.OBJECT, properties: { [AgentName.WEB]: { type: Type.OBJECT, properties: { webSignals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, url: { type: Type.STRING }, source: { type: Type.STRING }, excerpt: { type: Type.STRING }, sentiment: { type: Type.NUMBER } } } }}}}
                 };
                 break;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            },
        });
        return getJsonFromResponse(response) as AgentResultData;
    } catch (error) {
        console.error(`Error in generateAgentData for ${agentName}:`, error);
        throw new AgentError(
            `The ${agentName} agent failed to generate data.`,
            `This could be due to a temporary issue or an unsupported query for this agent. Try simplifying your prompt.`
        );
    }
};


export const synthesizeResults = async (results: AgentResultData[], prompt: string): Promise<string> => {
    if (!ai) return mockSynthesizeResults(results, prompt);

    const content = `Based on the user's prompt "${prompt}" and the following data gathered from various agents, please provide a concise, professional executive summary in Markdown format.

    Data:
    ${JSON.stringify(results, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: content,
        });
        return response.text;
    } catch (error) {
        console.error("Error in synthesizeResults:", error);
        throw new AgentError(
            "The Synthesis Agent failed to generate a summary.",
            "This usually happens if the worker agents did not return enough data. Check if individual agents have errors and try again."
        );
    }
};

export const initializeChat = (prompt: string, results: AgentResultData[], summary: string) => {
    if (!ai) return;

    const context = `You are a pharmaceutical industry analyst AI. The user's initial query was: "${prompt}". After running several data agents, the following executive summary was generated: "${summary}". Here is the raw data that informed the summary: ${JSON.stringify(results, null, 2)}. Your role is to answer follow-up questions concisely based ONLY on the provided context. Do not invent new data. If the answer is not in the context, state that clearly.`;
    
    chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: [
            { role: 'user', parts: [{ text: context }] },
            { role: 'model', parts: [{ text: "Understood. I've analyzed the report and the underlying data. I'm ready for your follow-up questions." }] }
        ]
    });
};

export const sendMessage = async (message: string): Promise<string> => {
    if (!ai || !chatSession) {
        return new Promise(resolve => setTimeout(() => resolve(`This is a mock chat response to your question: "${message}". I can provide more mock details if you ask. For example, the market seems to be growing steadily.`), 1000));
    }
    const response = await chatSession.sendMessage({ message });
    return response.text;
};