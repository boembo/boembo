export default function TotalTaskWidget( { settings }) {

console.log('TotalTaskWidget render');

    return (
            <div>
                <h1>total task widget</h1>
                {settings.showTitle.value && <h2>showing title</h2>}
            </div>
            );
}
