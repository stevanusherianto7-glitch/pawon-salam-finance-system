
import { GoogleGenAI } from "@google/genai";

export async function generatePrismaSchema(tsTypes: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert backend engineer specializing in Prisma and PostgreSQL.
      Your task is to convert the provided TypeScript interfaces and enums into a valid Prisma schema file (\`schema.prisma\`).

      **CRITICAL INSTRUCTIONS:**
      1.  **Header is MANDATORY:** You MUST include the \`datasource\` and \`generator\` blocks at the top of the schema.
          - The datasource provider MUST be "postgresql".
          - The datasource url MUST be \`env("DATABASE_URL")\`.
          - The generator provider MUST be "prisma-client-js".
      2.  **Map TypeScript to Prisma:**
          - TypeScript interfaces should become Prisma \`model\`s.
          - TypeScript enums should become Prisma \`enum\`s.
          - Use Prisma types: \`String\`, \`Int\`, \`Float\`, \`Boolean\`, \`DateTime\`, \`Json\`.
          - For financial data like \`salary\` or \`amount\`, use the \`Decimal\` type.
          - Map relation arrays (e.g., \`posts: Post[]\`) to Prisma relations (e.g., \`posts Post[]\`).
      3.  **Primary & Foreign Keys:**
          - Every model MUST have a primary key, usually \`@id\`. Use \`@default(uuid())\` for \`String\` IDs.
          - Define relations explicitly using \`@relation\` attributes with foreign key fields. For example:
            \`\`\`prisma
            model Post {
              id       String @id @default(uuid())
              author   User   @relation(fields: [authorId], references: [id])
              authorId String
            }
            \`\`\`
      4.  **Timestamps:** Automatically add \`createdAt\` and \`updatedAt\` fields to models where appropriate.
          - \`createdAt DateTime @default(now())\`
          - \`updatedAt DateTime @updatedAt\`
      5.  **Handle Optionals:** If a TypeScript property is optional (e.g., \`phone?: string\`), make the Prisma field optional with a \`?\`.
      6.  **Unique Fields:** Identify fields that should be unique (like \`email\`) and add the \`@unique\` attribute.
      7.  **Output Format:** Provide ONLY the raw Prisma schema code. Do not wrap it in markdown backticks or any other text.

      **EXAMPLE HEADER (MUST BE INCLUDED):**
      \`\`\`prisma
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL")
      }

      generator client {
        provider = "prisma-client-js"
      }
      \`\`\`

      Here are the TypeScript types to convert:
      ---
      ${tsTypes}
      ---
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            temperature: 0.1,
        }
    });

    if (response.text) {
        // Clean up markdown backticks if the model accidentally includes them
        const cleanedSchema = response.text.replace(/```prisma/g, '').replace(/```/g, '').trim();
        return cleanedSchema;
    } else {
        throw new Error('No response text from Gemini API.');
    }
  } catch (error) {
    console.error("Error generating Prisma schema:", error);
    return `// An error occurred while generating the schema.\n// Please check the console for details.\n// Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
