import FormLabel from "@/Components/Forms/FormLabel";

export default function InputLabel({
    value,
    className = "",
    children,
    ...props
}) {
    return (
        <FormLabel className={className} {...props}>
            {value ? value : children}
        </FormLabel>
    );
}
