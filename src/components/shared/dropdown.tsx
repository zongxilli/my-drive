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

type Option = {
	value: string;
	label: string | number | ReactNode;
};

type DropdownMenuProps = {
	options: Option[];
	value: string;
	setValue: Dispatch<SetStateAction<string>>;
};

const DropdownMenu = ({ options, value, setValue }: DropdownMenuProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className='h-8 w-36 justify-between rounded-lg shadow'
				>
					<div className='w-full flex items-center justify-between'>
						{value ? (
							options.find((option) => option.value === value)
								?.label
						) : (
							<div className='flex items-center gap-2'>
								<File className='w-4 h-4' />
								Type
							</div>
						)}
						<ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-[200px] p-0'>
				<Command>
					<CommandInput placeholder='Search file types...' />
					<CommandList>
						<CommandEmpty>No type found.</CommandEmpty>
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
