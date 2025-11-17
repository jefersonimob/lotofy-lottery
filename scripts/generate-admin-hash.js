const bcrypt = require('bcryptjs');

// Gerar hash para senha "admin123"
const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }

  console.log('\n===========================================');
  console.log('HASH GERADO PARA SENHA: admin123');
  console.log('===========================================');
  console.log('\nCopie este hash e substitua no SQL:');
  console.log('\n' + hash + '\n');
  console.log('===========================================\n');
  console.log('Comando SQL para inserir admin:');
  console.log('-------------------------------------------');
  console.log(`INSERT INTO profiles (id, email, password, full_name, role, created_at, updated_at)
VALUES (
  UUID(),
  'admin@lotofy.com',
  '${hash}',
  'Administrador',
  'admin',
  NOW(),
  NOW()
);`);
  console.log('\n===========================================\n');
});
