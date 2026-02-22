interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
}

export default function Container({
  children,
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8 ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
