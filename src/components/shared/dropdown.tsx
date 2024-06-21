'use client';

import { Check, ChevronsUpDown, File } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import clsx from 'clsx';

export type Option = {
	value: string;
	label: string | number | ReactNode;
};

type DropdownMenuProps = {
	options: Option[];
	value: string;
	setValue: Dispatch<SetStateAction<string>>;

	placeholder: string | number | ReactNode;
	disabled?: boolean;
	wide?: boolean;
};

const DropdownMenu = ({
	options,
	value,
	setValue,

	placeholder,
	disabled = false,
	wide = false,
}: DropdownMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className={clsx(
						'h-8 w-32 justify-between rounded-full shadow',
						{
							'w-44': wide,
						}
					)}
					disabled={disabled}
				>
					<div className='w-full max-w-full flex items-center justify-between'>
						{value
							? options.find((option) => option.value === value)
									?.label
							: placeholder}
						<ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0'>
				<Command>
					<CommandInput placeholder='Search file types...' />
					<CommandList>
						<CommandEmpty>No result found</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									className='cursor-pointer'
									value={option.value}
									onSelect={(currentValue) => {
										setValue(
											currentValue === value
												? ''
												: currentValue
										);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value === option.value
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

export default DropdownMenu;
