export default function HomeLayout({children}){
    return (
        <div>
            <header>
                <h1>Food Delivery App</h1>
            </header>

            <main>
                {children}
            </main>

            <footer>
                <p>© 2026 Food Delivery App</p>
            </footer>
        </div>
    );
}