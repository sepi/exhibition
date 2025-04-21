export
function CopyrightNotice({notice}) {
    return (
	<div style={{minHeight: 20,
		     textAlign: 'left',
		     paddingLeft: 8,
		     color: 'gray',
		     position: 'absolute',
		     bottom: 5}}>
	    { notice }
	</div>);
}
