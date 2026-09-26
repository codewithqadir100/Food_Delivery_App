import Button from "@/Components/Common/Button";

export default function SecondaryButton({
    type = "button",
    className = "",
    disabled,
    children,
    ...props
}) {
    return (
        <Button
            type={type}
            variant="secondary"
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </Button>
    );
}
