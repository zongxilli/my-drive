import {
	OrganizationSwitcher,
	SignedOut,
	SignInButton,
	UserButton,
} from '@clerk/nextjs';
import React from 'react';
import { FaGoogleDrive } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Header = () => {
	return (
		<div className='h-[7dvh] w-full px-6 flex justify-between items-center bg-google-extraLightBlue'>
			<Link href='/dashboard/files'>
				<div className='flex items-center gap-2 cursor-pointer'>
					<FaGoogleDrive className='w-6 h-6 text-gray-300' />
					<div className='text-xl'>Drive</div>
				</div>
			</Link>
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
	);
};

export default Header;
