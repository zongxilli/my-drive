import { useOrganization } from '@clerk/nextjs';
import { useEffect } from 'react';

const useAdminPermission = () => {
	const organization = useOrganization();

	useEffect(() => console.log(organization), [organization]);

	return (
		organization.organization === null ||
		organization.membership?.role === 'org:admin'
	);
};

export default useAdminPermission;
