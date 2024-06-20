'use client';

import { ReactNode, useEffect, useState } from 'react';
import {
	Download,
	EllipsisVerticalIcon,
	ExternalLink,
	GanttChartIcon,
	History,
	ImageIcon,
	Star,
	StarOff,
	TextIcon,
	Trash,
	Trash2,
	TrashIcon,
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { FaFilePdf, FaFileCsv, FaImage, FaRegImages } from 'react-icons/fa6';
import { MdPictureAsPdf } from 'react-icons/md';
import { CiImageOn } from 'react-icons/ci';
import { LuText } from 'react-icons/lu';
import { IoImages } from 'react-icons/io5';
import { PiFilePdfLight, PiFileCsvLight } from 'react-icons/pi';
import { IoMdOpen, IoMdDownload, IoMdTrash } from 'react-icons/io';

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
import { useToast } from '@/components/ui/use-toast';

import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import Image from 'next/image';
import { FileWithStarred } from '../../../../convex/files';
import useAdminPermission from '@/hooks/useAdminPermission';
import { useUser } from '@clerk/nextjs';
import clsx from 'clsx';

type FileCardProps = {
	file: FileWithStarred;
};

// TODO: add 'createdBy` to file and let user to be able to delete the file if user is the creator

const FileCard = ({ file }: FileCardProps) => {
	const { toast } = useToast();
	const { user } = useUser();
	const hasAdminPermission = useAdminPermission();
	const isFileCreatedByCurrentUser = user?.id === file.createByIdentifier;

	const deleteFile = useMutation(api.files.deleteFile);
	const restoreFile = useMutation(api.files.restoreFile);
	const moveFileToTrash = useMutation(api.files.moveFileToTrash);
	const toggleStar = useMutation(api.files.toggleStar);

	const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);

	const fileIcons = {
		image: <IoImages className='h-5 w-5 flex-shrink-0 text-blue-600' />,
		pdf: <MdPictureAsPdf className=' h-5 w-5 flex-shrink-0 text-red-600' />,
		csv: <LuText className=' h-5 w-5 flex-shrink-0 text-gray-600' />,
	} as Record<Doc<'files'>['type'], ReactNode>;

	const handleMoveToTrash = async () => {
		await moveFileToTrash({ fileId: file._id });

		toast({
			variant: 'destructive',
			title: 'File moved to trash',
			description: 'This file will be deleted in 30 days',
		});
	};

	const handleDelete = async () => {
		await deleteFile({ fileId: file._id });

		toast({
			variant: 'destructive',
			title: 'File deleted',
			description: 'This file has been permanently removed',
		});
	};

	const handleRestore = async () => {
		await restoreFile({ fileId: file._id });

		toast({
			variant: 'success',
			title: 'File restored',
			description: 'This file has been moved back to all files',
		});
	};

	const renderDropdownMenu = () => {
		const renderDropdownMenuItem = (
			icon: ReactNode,
			label: string,
			onClickHandler: () => void,
			warning?: boolean,
			show?: boolean
		) => {
			if (!show) return null;

			return (
				<DropdownMenuItem
					className={clsx('flex items-center gap-2 cursor-pointer', {
						' text-red-600': warning,
					})}
					onClick={onClickHandler}
				>
					{icon}
					{label}
				</DropdownMenuItem>
			);
		};

		return (
			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVerticalIcon size={20} />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{renderDropdownMenuItem(
						<ExternalLink className='w-4 h-4' />,
						'Open',
						() => window.open(file.url, '_blank'),
						false,
						true
					)}
					{renderDropdownMenuItem(
						<StarOff className='w-4 h-4' />,
						'Remove from starred',
						() => toggleStar({ fileId: file._id }),
						false,
						file.isStarred
					)}
					{renderDropdownMenuItem(
						<Star className='w-4 h-4' />,
						'Add to starred',
						() => toggleStar({ fileId: file._id }),
						false,
						!file.isStarred
					)}

					<DropdownMenuSeparator />

					{renderDropdownMenuItem(
						<History className='w-4 h-4' />,
						'Restore',
						handleRestore,
						false,
						file.movedToTrash
					)}
					{renderDropdownMenuItem(
						<Trash className='w-4 h-4' />,
						'Move to trash',
						handleMoveToTrash,
						true,
						!file.movedToTrash
					)}
					{renderDropdownMenuItem(
						<Trash2 className='w-4 h-4' />,
						'Delete forever',
						() => setShowDeleteFileModal(true),
						true,
						file.movedToTrash
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	};

	const renderDeleteFileModal = () => {
		return (
			<AlertDialog
				open={showDeleteFileModal}
				onOpenChange={setShowDeleteFileModal}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action will permanently delete the file.
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
			<Card className='h-[15.625rem] rounded-xl bg-google-lightBlue'>
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
				<CardFooter className='py-2 px-2'></CardFooter>
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
