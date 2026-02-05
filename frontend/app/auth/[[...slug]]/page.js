'use client';

import { usePathname } from 'next/navigation';
import AuthLayout from '../../../src/container/profile/authentication/Index';
import { getBasePath } from '../../../src/utility/getBasePath';

// Direct imports - no lazy loading for maximum performance
import Login from '../../../src/container/profile/authentication/overview/SignIn';
import SignUp from '../../../src/container/profile/authentication/overview/Signup';
import ForgotPass from '../../../src/container/profile/authentication/overview/ForgotPassword';

function AuthPageContent({ params }) {
  const pathname = usePathname();
  const basePath = getBasePath();
  
  // Get slug from params or parse from pathname
  let slug = params?.slug?.[0];
  
  // If no slug in params, try to extract from pathname
  if (!slug) {
    // Remove basePath if present, then remove /auth prefix
    const cleanPath = basePath && pathname.startsWith(basePath) 
      ? pathname.replace(basePath, '') 
      : pathname;
    slug = cleanPath.replace('/auth', '').replace(/^\//, '') || '';
  }
  
  let Component = Login;
  
  if (slug === 'register' || pathname.includes('/register')) {
    Component = SignUp;
  } else if (slug === 'forgotPassword' || pathname.includes('/forgotPassword')) {
    Component = ForgotPass;
  }

  // Direct render - no dynamic loading, all components loaded immediately
  return <Component />;
}

export default AuthLayout(AuthPageContent);
