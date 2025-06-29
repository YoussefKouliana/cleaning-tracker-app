// src/utils/setupInitialUsers.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUserProfile } from '../firebase/userManagement';

export const setupInitialUsers = async () => {
  try {
    console.log('Setting up initial users...');

    // Create Superior Admin
    try {
      const superAdminCredential = await createUserWithEmailAndPassword(
        auth, 
        'superadmin@fluffycandy.se', 
        'SuperAdmin123@'
      );
      await createUserProfile(
        superAdminCredential.user.uid,
        'superadmin@fluffycandy.se',
        'Superior Administrator',
        'superior_admin'
      );
      console.log('✅ Superior Admin created');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Superior Admin already exists');
      } else {
        console.error('❌ Error creating Superior Admin:', error.message);
      }
    }

    // Create Regular Admin
    try {
      const adminCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@fluffycandy.se', 
        'admin123@'
      );
      await createUserProfile(
        adminCredential.user.uid,
        'admin@fluffycandy.se',
        'Regular Administrator',
        'admin'
      );
      console.log('✅ Regular Admin created');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Regular Admin already exists');
      } else {
        console.error('❌ Error creating Regular Admin:', error.message);
      }
    }

    console.log('🎉 Initial setup complete!');
    console.log('📋 Login credentials:');
    console.log('  Superior Admin: superadmin@fluffycandy.se / SuperAdmin123@');
    console.log('  Regular Admin: admin@fluffycandy.se / admin123@');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
};

export const createFluffyCandySuperAdmin = async () => {
  try {
    console.log('Creating Fluffy Candy Superior Admin...');

    const superAdminCredential = await createUserWithEmailAndPassword(
      auth, 
      'superadmin@fluffycandy.se', 
      'SuperAdmin123@'
    );
    
    await createUserProfile(
      superAdminCredential.user.uid,
      'superadmin@fluffycandy.se',
      'Superior Administrator',
      'superior_admin'
    );
    
    console.log('✅ Fluffy Candy Superior Admin created: superadmin@fluffycandy.se');
    return { success: true };
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Email already in use');
      return { success: false, message: 'Email already in use' };
    } else {
      console.error('❌ Error:', error.message);
      return { success: false, message: error.message };
    }
  }
};

export const createFluffyCandyAdmin = async () => {
  try {
    console.log('Creating Fluffy Candy Regular Admin...');

    const adminCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@fluffycandy.se', 
      'admin123@'
    );
    
    await createUserProfile(
      adminCredential.user.uid,
      'admin@fluffycandy.se',
      'Regular Administrator',
      'admin'
    );
    
    console.log('✅ Fluffy Candy Regular Admin created: admin@fluffycandy.se');
    return { success: true };
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Email already in use');
      return { success: false, message: 'Email already in use' };
    } else {
      console.error('❌ Error:', error.message);
      return { success: false, message: error.message };
    }
  }
};