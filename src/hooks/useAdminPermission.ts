import { useOrganization } from '@clerk/nextjs';
import { useEffect } from 'react';

const useAdminPermission = () => {
	const organization = useOrganization();

	return (
		organization.organization === null ||
		organization.membership?.role === 'org:admin'
	);
};

export default useAdminPermission;
