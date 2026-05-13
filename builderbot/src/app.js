/**
 * DevJobs BuilderBot - WhatsApp Chatbot con AI
 * 
 * Configuración:
 * - Provider: Baileys (WhatsApp)
 * - Database: In-memory (temporal)
 * - AI: OpenAI GPT-4o
 */
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

const PORT = process.env.PORT ?? 3008
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// ============================================
// Flows
// ============================================

// Flow de Bienvenida
const welcomeFlow = addKeyword(EVENTS.WELCOME).addAction(async (ctx, ctxFn) => {
    const { flowDynamic } = ctxFn
    
    await flowDynamic('🙌 ¡Hola! Bienvenido al Chatbot de DevJobs 🚀')
    await flowDynamic('Soy tu asistente virtual para encontrar lavoro en tecnología.')
    await flowDynamic('Puedo ayudarte con:')
    await flowDynamic('• Buscar ofertas de empleo')
    await flowDynamic('• Información sobre empresas')
    await flowDynamic('• Tips para tu postulación')
    await flowDynamic('\n¿En qué puedo ayudarte hoy?')
})

// Flow simple de empleo
const jobsFlow = addKeyword(['jobs', 'empleo', 'trabajo']).addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('🔍 Estoy buscando las últimas ofertas de empleo...')
    await flowDynamic('Aquí tienes algunas oportunidades:')
    await flowDynamic('📍 *Senior React Developer* - Remote')
    await flowDynamic('   Tech: React, TypeScript, Node.js')
    await flowDynamic('   Salary: $80k-120k USD/year')
    await flowDynamic('\n📍 *Full Stack Developer* - Hybrid (Madrid)')
    await flowDynamic('   Tech: Next.js, PostgreSQL, AWS')
    await flowDynamic('   Salary: €50k-70k EUR/year')
    await flowDynamic('\n¿Quieres postularte a alguna? Dime cuál.')
})

// Flow de información
const infoFlow = addKeyword(['info', 'información']).addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('📚 Aquí tienes información sobre DevJobs:')
    await flowDynamic('• Plataforma de empleo tech #1 en Latinoamérica')
    await flowDynamic('• +10,000 empresas reclutando')
    await flowDynamic('• Proceso gratuito para candidatos')
    await flowDynamic('\nVisítanos: https://devjobs.com')
})

// Flow de ayuda
const helpFlow = addKeyword(['ayuda', 'help', 'menu']).addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('📋 *Menú de comandos:*')
    await flowDynamic('• *jobs* - Ver ofertas de empleo')
    await flowDynamic('• *info* - Información de DevJobs')
    await flowDynamic('• *empleo* - Buscar trabajo')
})

// ============================================
// Main
// ============================================
const main = async () => {
    const adapterFlow = createFlow([welcomeFlow, jobsFlow, infoFlow, helpFlow])
    
    // Provider Baileys (WhatsApp)
    const adapterProvider = createProvider(Provider, {
        version: [2, 3000, 1054824857]
    })
    
    // Database in-memory (sin MongoDB por ahora)
    const adapterDB = new Database()
    
    const configBot = {
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB
    }
    
    // Agregar AI si hay API key
    if (OPENAI_API_KEY) {
        try {
            const { EmployeesClass } = await import('@builderbot-plugins/openai-agents')
            const openai = new EmployeesClass({
                apiKey: OPENAI_API_KEY,
                model: 'gpt-4o',
                temperature: 0
            })
            
            openai.employees([
                {
                    name: 'JOBS_AGENT',
                    description: 'Asistente de empleos',
                    flow: jobsFlow
                }
            ])
            
            configBot.extensions = {
                employeesAddon: openai
            }
            console.log('✅ AI Agents cargado con GPT-4o')
        } catch (e) {
            console.warn('⚠️ OpenAI no disponible:', e.message)
        }
    } else {
        console.log('ℹ️ Sin OPENAI_API_KEY - modo básico sin AI')
    }
    
    const { handleCtx, httpServer } = await createBot(configBot)
    
    // API: Enviar mensajes
    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )
    
    // API: Health check
    adapterProvider.server.get('/health', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'ok', service: 'builderbot', ai: !!OPENAI_API_KEY }))
    })
    
    httpServer(+PORT)
    console.log(`🤖 BuilderBot corriendo en puerto ${PORT}`)
}

main().catch(console.error)