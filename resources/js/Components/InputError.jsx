import FormError from "@/Components/Forms/FormError";

export default function InputError({ message, className = "", ...props }) {
    return <FormError message={message} className={className} {...props} />;
}
