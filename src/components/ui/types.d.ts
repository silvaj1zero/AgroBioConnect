// Type declarations for shadcn/ui JSX components

declare module '@/components/ui/button' {
  import type { ButtonHTMLAttributes, ReactNode } from 'react'
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
    children?: ReactNode
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/card' {
  import type { HTMLAttributes, ReactNode } from 'react'
  interface CardProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
  export const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>
  export const CardHeader: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>
  export const CardTitle: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLHeadingElement>>
  export const CardDescription: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLParagraphElement>>
  export const CardContent: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>
  export const CardFooter: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>
}

declare module '@/components/ui/input' {
  import type { InputHTMLAttributes } from 'react'
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>
}

declare module '@/components/ui/label' {
  import type { LabelHTMLAttributes, ReactNode } from 'react'
  interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { children?: ReactNode }
  export const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>
}

declare module '@/components/ui/tabs' {
  import type { HTMLAttributes, ReactNode } from 'react'
  interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    children?: ReactNode
  }
  interface TabsListProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
  interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> { value: string; children?: ReactNode }
  interface TabsContentProps extends HTMLAttributes<HTMLDivElement> { value: string; children?: ReactNode }
  export const Tabs: React.FC<TabsProps>
  export const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>
  export const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>
  export const TabsContent: React.ForwardRefExoticComponent<TabsContentProps & React.RefAttributes<HTMLDivElement>>
}

declare module '@/components/ui/toaster' {
  export const Toaster: React.FC
}

declare module '@/components/ui/toast' {
  export const Toast: React.FC<any>
  export const ToastAction: React.FC<any>
  export const ToastClose: React.FC<any>
  export const ToastDescription: React.FC<any>
  export const ToastProvider: React.FC<any>
  export const ToastTitle: React.FC<any>
  export const ToastViewport: React.FC<any>
}

declare module '@/components/ui/use-toast' {
  export function useToast(): {
    toast: (opts: { title?: string; description?: string; variant?: string }) => void
    toasts: any[]
    dismiss: (id?: string) => void
  }
}

declare module '@/components/ui/badge' {
  import type { HTMLAttributes, ReactNode } from 'react'
  interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    children?: ReactNode
  }
  export const Badge: React.FC<BadgeProps>
}

declare module '@/components/ui/select' {
  import type { ReactNode } from 'react'
  interface SelectProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children?: ReactNode
  }
  interface SelectTriggerProps {
    className?: string
    children?: ReactNode
  }
  interface SelectContentProps {
    className?: string
    children?: ReactNode
  }
  interface SelectItemProps {
    value: string
    className?: string
    children?: ReactNode
  }
  interface SelectValueProps {
    placeholder?: string
  }
  export const Select: React.FC<SelectProps>
  export const SelectTrigger: React.ForwardRefExoticComponent<SelectTriggerProps & React.RefAttributes<HTMLButtonElement>>
  export const SelectContent: React.ForwardRefExoticComponent<SelectContentProps & React.RefAttributes<HTMLDivElement>>
  export const SelectItem: React.ForwardRefExoticComponent<SelectItemProps & React.RefAttributes<HTMLDivElement>>
  export const SelectValue: React.FC<SelectValueProps>
  export const SelectGroup: React.FC<{ children?: ReactNode }>
  export const SelectLabel: React.FC<{ children?: ReactNode; className?: string }>
  export const SelectSeparator: React.FC<{ className?: string }>
  export const SelectScrollUpButton: React.FC<{ className?: string }>
  export const SelectScrollDownButton: React.FC<{ className?: string }>
}

declare module '@/components/ui/separator' {
  interface SeparatorProps {
    className?: string
    orientation?: 'horizontal' | 'vertical'
    decorative?: boolean
  }
  export const Separator: React.ForwardRefExoticComponent<SeparatorProps & React.RefAttributes<HTMLDivElement>>
}

declare module '@/components/ui/progress' {
  interface ProgressProps {
    value?: number
    max?: number
    className?: string
  }
  export const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>
}

declare module '@/components/ui/textarea' {
  import type { TextareaHTMLAttributes } from 'react'
  interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}
  export const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>
}

declare module '@/components/ui/scroll-area' {
  import type { HTMLAttributes, ReactNode } from 'react'
  interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> { children?: ReactNode }
  export const ScrollArea: React.ForwardRefExoticComponent<ScrollAreaProps & React.RefAttributes<HTMLDivElement>>
  export const ScrollBar: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/skeleton' {
  import type { HTMLAttributes } from 'react'
  export function Skeleton(props: HTMLAttributes<HTMLDivElement>): JSX.Element
}

declare module '@/components/ui/switch' {
  interface SwitchProps {
    checked?: boolean
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean) => void
    disabled?: boolean
    className?: string
    id?: string
    name?: string
  }
  export const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/dialog' {
  import type { ReactNode } from 'react'
  interface DialogProps { open?: boolean; onOpenChange?: (open: boolean) => void; children?: ReactNode }
  interface DialogContentProps { className?: string; children?: ReactNode }
  interface DialogHeaderProps { className?: string; children?: ReactNode }
  interface DialogTitleProps { className?: string; children?: ReactNode }
  interface DialogDescriptionProps { className?: string; children?: ReactNode }
  interface DialogFooterProps { className?: string; children?: ReactNode }
  interface DialogTriggerProps { asChild?: boolean; children?: ReactNode }
  export const Dialog: React.FC<DialogProps>
  export const DialogTrigger: React.FC<DialogTriggerProps>
  export const DialogContent: React.ForwardRefExoticComponent<DialogContentProps & React.RefAttributes<HTMLDivElement>>
  export const DialogHeader: React.FC<DialogHeaderProps>
  export const DialogTitle: React.ForwardRefExoticComponent<DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>
  export const DialogDescription: React.ForwardRefExoticComponent<DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>
  export const DialogFooter: React.FC<DialogFooterProps>
  export const DialogClose: React.FC<{ children?: ReactNode; asChild?: boolean }>
}

declare module '@/components/ui/dropdown-menu' {
  import type { ReactNode } from 'react'
  export const DropdownMenu: React.FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>
  export const DropdownMenuTrigger: React.FC<{ children?: ReactNode; asChild?: boolean }>
  export const DropdownMenuContent: React.ForwardRefExoticComponent<any>
  export const DropdownMenuItem: React.ForwardRefExoticComponent<any>
  export const DropdownMenuSeparator: React.ForwardRefExoticComponent<any>
  export const DropdownMenuLabel: React.ForwardRefExoticComponent<any>
  export const DropdownMenuGroup: React.FC<{ children?: ReactNode }>
  export const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<any>
  export const DropdownMenuRadioGroup: React.FC<any>
  export const DropdownMenuRadioItem: React.ForwardRefExoticComponent<any>
  export const DropdownMenuSub: React.FC<any>
  export const DropdownMenuSubContent: React.ForwardRefExoticComponent<any>
  export const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/tooltip' {
  import type { ReactNode } from 'react'
  export const Tooltip: React.FC<{ children?: ReactNode; delayDuration?: number }>
  export const TooltipTrigger: React.FC<{ children?: ReactNode; asChild?: boolean }>
  export const TooltipContent: React.ForwardRefExoticComponent<any>
  export const TooltipProvider: React.FC<{ children?: ReactNode; delayDuration?: number }>
}

declare module '@/components/ui/alert-dialog' {
  import type { ReactNode } from 'react'
  export const AlertDialog: React.FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>
  export const AlertDialogTrigger: React.FC<{ children?: ReactNode; asChild?: boolean }>
  export const AlertDialogContent: React.ForwardRefExoticComponent<any>
  export const AlertDialogHeader: React.FC<{ className?: string; children?: ReactNode }>
  export const AlertDialogTitle: React.ForwardRefExoticComponent<any>
  export const AlertDialogDescription: React.ForwardRefExoticComponent<any>
  export const AlertDialogFooter: React.FC<{ className?: string; children?: ReactNode }>
  export const AlertDialogAction: React.ForwardRefExoticComponent<any>
  export const AlertDialogCancel: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/table' {
  import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react'
  export const Table: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableElement>>
  export const TableHeader: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableSectionElement>>
  export const TableBody: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableSectionElement>>
  export const TableFooter: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableSectionElement>>
  export const TableRow: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableRowElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableRowElement>>
  export const TableHead: React.ForwardRefExoticComponent<ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableCellElement>>
  export const TableCell: React.ForwardRefExoticComponent<TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableCellElement>>
  export const TableCaption: React.ForwardRefExoticComponent<HTMLAttributes<HTMLTableCaptionElement> & { children?: ReactNode } & React.RefAttributes<HTMLTableCaptionElement>>
}

declare module '@/components/ui/checkbox' {
  interface CheckboxProps {
    checked?: boolean | 'indeterminate'
    defaultChecked?: boolean
    onCheckedChange?: (checked: boolean | 'indeterminate') => void
    disabled?: boolean
    className?: string
    id?: string
    name?: string
  }
  export const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/popover' {
  import type { ReactNode } from 'react'
  export const Popover: React.FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>
  export const PopoverTrigger: React.FC<{ children?: ReactNode; asChild?: boolean }>
  export const PopoverContent: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/command' {
  import type { ReactNode, InputHTMLAttributes } from 'react'
  export const Command: React.ForwardRefExoticComponent<any>
  export const CommandInput: React.ForwardRefExoticComponent<InputHTMLAttributes<HTMLInputElement> & { children?: ReactNode } & React.RefAttributes<HTMLInputElement>>
  export const CommandList: React.ForwardRefExoticComponent<any>
  export const CommandEmpty: React.ForwardRefExoticComponent<any>
  export const CommandGroup: React.ForwardRefExoticComponent<any>
  export const CommandItem: React.ForwardRefExoticComponent<any>
  export const CommandSeparator: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/form' {
  import type { ReactNode } from 'react'
  export const Form: React.FC<any>
  export const FormField: React.FC<any>
  export const FormItem: React.ForwardRefExoticComponent<any>
  export const FormLabel: React.ForwardRefExoticComponent<any>
  export const FormControl: React.ForwardRefExoticComponent<any>
  export const FormDescription: React.ForwardRefExoticComponent<any>
  export const FormMessage: React.ForwardRefExoticComponent<any>
  export function useFormField(): any
}

declare module '@/components/ui/accordion' {
  import type { ReactNode } from 'react'
  export const Accordion: React.ForwardRefExoticComponent<any>
  export const AccordionItem: React.ForwardRefExoticComponent<any>
  export const AccordionTrigger: React.ForwardRefExoticComponent<any>
  export const AccordionContent: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/avatar' {
  import type { ReactNode } from 'react'
  export const Avatar: React.ForwardRefExoticComponent<any>
  export const AvatarImage: React.ForwardRefExoticComponent<any>
  export const AvatarFallback: React.ForwardRefExoticComponent<any>
}

declare module '@/components/ui/radio-group' {
  import type { ReactNode } from 'react'
  interface RadioGroupProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    className?: string
    children?: ReactNode
  }
  interface RadioGroupItemProps {
    value: string
    id?: string
    className?: string
  }
  export const RadioGroup: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>
  export const RadioGroupItem: React.ForwardRefExoticComponent<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>
}

declare module '@/components/ui/calendar' {
  export const Calendar: React.FC<any>
}

declare module '@/components/ui/sidebar' {
  export const Sidebar: React.FC<any>
  export const SidebarContent: React.FC<any>
  export const SidebarFooter: React.FC<any>
  export const SidebarGroup: React.FC<any>
  export const SidebarGroupContent: React.FC<any>
  export const SidebarGroupLabel: React.FC<any>
  export const SidebarHeader: React.FC<any>
  export const SidebarMenu: React.FC<any>
  export const SidebarMenuButton: React.FC<any>
  export const SidebarMenuItem: React.FC<any>
  export const SidebarProvider: React.FC<any>
  export const SidebarTrigger: React.FC<any>
  export function useSidebar(): any
}
