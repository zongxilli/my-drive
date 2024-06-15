import { useState } from 'react';
import { EllipsisVerticalIcon, TrashIcon } from 'lucide-react';
import { useMutation } from 'convex/react';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

import { Doc } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';

type FileCardProps = {
	file: Doc<'files'>;
};

const FileCard = ({ file }: FileCardProps) => {
	const { toast } = useToast();

	const deleteFile = useMutation(api.files.deleteFile);

	const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

	const renderDropdownMenu = () => {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVerticalIcon />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem
						className='flex items-center gap-1 text-red-600 cursor-pointer'
						onClick={() => setShowDeleteFileModal(true)}
					>
						<TrashIcon className='w-4 h-4' />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const renderDeleteFileModal = () => {
		const handleDelete = async () => {
			await deleteFile({ fileId: file._id });

			toast({
				variant: 'destructive',
				title: 'File deleted',
				description: 'You have successfully deleted this file',
			});
		};

		return (
			<AlertDialog
				open={showDeleteFileModal}
				onOpenChange={setShowDeleteFileModal}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete your account and remove your data from our
							servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	};

	const renderFileCard = () => {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='w-full flex justify-between items-center gap-2'>
						<div className='text-ellipsis whitespace-nowrap overflow-hidden min-w-0'>
							{file.name}
						</div>
						{renderDropdownMenu()}
					</CardTitle>
					{/* <CardDescription>Card Description</CardDescription> */}
				</CardHeader>
				<CardContent>
					<p>Card Content</p>
				</CardContent>
				<CardFooter>
					<Button>Download</Button>
				</CardFooter>
			</Card>
		);
	};

	return (
		<>
			{renderFileCard()}
			{renderDeleteFileModal()}
		</>
	);
};

export default FileCard;
