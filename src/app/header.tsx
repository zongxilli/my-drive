import {
  OrganizationSwitcher,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";

import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <div className='border-b py-4 bg-grey-50'>
      <div className='container mx-auto flex justify-between items-center'>
        <div>My Drive</div>
        <div className='flex gap-2'>
          <OrganizationSwitcher />
          <UserButton />
          <SignedOut>
            <SignInButton mode='modal'>
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

export default Header;
