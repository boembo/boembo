import { useDispatch, useSelector } from 'react-redux';


export default function TotalTaskWidget( { settings }) {

console.log('Team Widget render');
console.log(settings);

    return (
            <div>
                <h1>team task widget</h1>
                {settings.showTitle.value && <h2>showing title</h2>}
            </div>
            );
}
