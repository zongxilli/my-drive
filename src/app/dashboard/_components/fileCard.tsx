import { ReactNode, useState } from 'react';
import {
	EllipsisVerticalIcon,
	GanttChartIcon,
	ImageIcon,
	TextIcon,
	TrashIcon,
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { FaFilePdf, FaFileCsv, FaImage, FaRegImages } from 'react-icons/fa6';
import { MdPictureAsPdf } from 'react-icons/md';
import { CiImageOn } from 'react-icons/ci';
import { LuText } from 'react-icons/lu';
import { IoImages } from 'react-icons/io5';
import { PiFilePdfLight, PiFileCsvLight } from 'react-icons/pi';

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

import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import Image from 'next/image';

const getFileUrl = (fileId: Id<'_storage'>): string => {
	const url = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
	console.log(url);
	console.log(
		'https://sleek-bulldog-114.convex.cloud/api/storage/4f65aa52-2c6a-4713-9aa1-d3d5ea87ad2a'
	);
	console.log(
		url ===
			'https://sleek-bulldog-114.convex.cloud/api/storage/4f65aa52-2c6a-4713-9aa1-d3d5ea87ad2a'
	);

	return url;
};

type FileCardProps = {
	file: Doc<'files'>;
};

const FileCard = ({ file }: FileCardProps) => {
	const { toast } = useToast();

	const deleteFile = useMutation(api.files.deleteFile);

	const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

	const fileIcons = {
		image: <IoImages className='h-5 w-5 flex-shrink-0 text-blue-800' />,
		pdf: <MdPictureAsPdf className=' h-5 w-5 flex-shrink-0 text-red-600' />,
		csv: <LuText className=' h-5 w-5 flex-shrink-0 text-gray-600' />,
	} as Record<Doc<'files'>['type'], ReactNode>;

	const renderDropdownMenu = () => {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVerticalIcon size={20} />
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
			<Card className='h-72'>
				<CardHeader className='p-4'>
					<div className='w-full flex items-center gap-2'>
						{fileIcons[file.type]}
						<div className='flex-grow text-ellipsis whitespace-nowrap overflow-hidden min-w-0 text-xl'>
							{file.name}
						</div>
						{renderDropdownMenu()}
					</div>
				</CardHeader>
				<div className='w-full h-[60%] px-2 flex justify-center items-center'>
					{file.type === 'image' && (
						<Image
							src={file.url}
							alt={file.name}
							width='200'
							height='200'
							className='w-full h-full rounded-md object-cover'
						/>
					)}
					{file.type === 'pdf' && (
						<PiFilePdfLight className='w-20 h-20' />
					)}
					{file.type === 'csv' && (
						<PiFileCsvLight className='w-20 h-20' />
					)}
				</div>
				<CardFooter className='py-2 px-2'>
					<Button
						onClick={() => {
							window.open(file.url, '_blank');
						}}
					>
						Download
					</Button>
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
