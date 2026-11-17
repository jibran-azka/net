const SERIF = "'Playfair Display', Georgia, serif";

export default function Heading({
    title,
    description,
    variant = "default",
}: {
    title: string;
    description?: string;
    variant?: "default" | "small";
}) {
    return (
        <header
            className={variant === "small" ? "space-y-1.5" : "mb-8 space-y-1.5"}
        >
            <h2
                className={
                    variant === "small"
                        ? "text-2xl leading-tight text-slate-900"
                        : "text-3xl leading-tight text-slate-900"
                }
                style={{ fontFamily: SERIF, fontWeight: 700 }}
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm leading-relaxed text-slate-500">
                    {description}
                </p>
            )}
        </header>
    );
}
