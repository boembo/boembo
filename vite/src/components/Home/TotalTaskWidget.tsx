export default function TotalTaskWidget({ settings }) {


console.log('TOTAL Widget render');
console.log(settings);


  return (
    <div>
      <h1>TOTALLLLLLLLL</h1>
      {settings.showTitle.value && <h2>showing title</h2>}
    </div>
  );
}
