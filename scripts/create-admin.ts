import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Criando usuário admin...\n')

    // Dados do admin
    const email = 'admin@lotofy.com'
    const password = 'admin123'
    const fullName = 'Administrador'

    // Deletar admin se já existe
    console.log('🗑️  Limpando admin anterior (se existir)...')
    await prisma.profile.deleteMany({
      where: { email },
    })
    console.log('✅ Limpeza concluída\n')

    // Hash da senha
    console.log('🔒 Gerando hash da senha...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Hash gerado\n')

    // Criar admin
    console.log('👤 Criando novo admin...')
    const admin = await prisma.profile.create({
      data: {
        id: randomUUID(),
        email,
        password: hashedPassword,
        fullName,
        role: 'admin',
      },
    })

    console.log('✅ Admin criado com sucesso!\n')
    console.log('📋 Credenciais:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Senha: ${password}`)
    console.log(`👤 Role:  ${admin.role}`)
    console.log(`🆔 ID:    ${admin.id}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('✨ Agora você pode fazer login em: http://localhost:3000/auth/login\n')
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error)
    console.error('\n🔍 Detalhes do erro:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
