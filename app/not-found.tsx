import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-surface to-accent-blue/10">
      <Container className="text-center py-24">
        <h1 className="font-heading text-8xl sm:text-9xl font-bold text-primary/30 mb-4">
          404
        </h1>
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-4">
          Page Not Found
        </h2>
        <p className="font-body text-lg text-text-secondary mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button href="/th/" variant="primary" size="lg">
          Back to Home
        </Button>
      </Container>
    </main>
  );
}
