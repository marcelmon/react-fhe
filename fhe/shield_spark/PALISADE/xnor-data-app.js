/*
// <html>

// <div id="root">
// </div>


//  <!-- data viewer when a collection is selected -->
// <div>

// 	<table>
// 		<tr>
// 			<td>
// 				Key 1
// 				<table>
// 					<tr>
// 						<td>
// 							<table data-type="key" key-id="1">
// 								<td>
// 									Bit 1
// 									<PolyViewer data-type="key" key-id="1" bit-id="1" selected="true"/>
// 								</td>
// 								<td>
// 									Bit 2
// 									<PolyViewer data-type="key" key-id="1" bit-id="2" selected="false"/>
// 								</td>
// 								<td>
// 									Bit 3
// 									<PolyViewer data-type="key" key-id="1" bit-id="3" selected="false"/>
// 								</td>
// 							</table>
// 						</td>
// 					</tr>
// 				</table>
// 			</td>
// 			<td>
// 				Value 1
// 				<PolyViewer data-type="value" key-id="1" selected="false"/>
// 			</td>
// 		</tr>
// </div>

// <html>

// <script>
<?php

if(!isset($_GET['data_type'])){
	echo js;
	return;
}

switch($_GET['data_type']){
	case 'collection_info':

		$collectionArray = array(
			1 => array(
				'colloquialName' => 'col1', 
				'numKeys' => 2,
				'numKeyBits'=> 3
				),
			2 => array(
				'colloquialName' => 'col2', 
				'numKeys' => 4,
				'numKeyBits'=> 5
				),
			);
		echo json_encode($collectionArray);
		break;
	case 'key_bit_ctext':
	case 'value_ctext':
		$ctextArray = array(
			
			array(
				array(1, 2, 3),
				array(4, 5, 6),
				array(7, 8, 9),
				),
			array(
				array(21, 22, 23),
				array(24, 25, 26),
				array(27, 28, 29),
				),
			array(
				array(31, 32, 33),
				array(34, 35, 36),
				array(37, 38, 39),
				),
			);
		echo json_encode($ctextArray);
		break;
	default:
		break;

}



?>
*/
currentlyFetching = false;

function fetch(dataType, ...params){

	if(currentlyFetching){
		return false;
	}

	collectionId = null;
	keyId = null;
	keyBitId = null;
	url = null;

	switch(dataType){
		case 'collection_info':
			collectionId = params[0];
			url = "/?data_type=collections";
			break;
		case 'key_bit_ctext':
			collectionId = params[0];
			keyId = params[1];
			keyBitId = params[2];
			url = "/?data_type=key_bit_ctext&collectionId={collectionId}&keyId={keyId}&keyBitId={keyBitId}";
			break;
		case 'value_ctext':
			collectionId = params[0];
			keyId = params[1];
			url = "/?data_type=value_ctext&collectionId={collectionId}&keyId={keyId}";
			break;
		default:
			throw new Error('Invalid request data type.');
	}

	// Return a new promise.
	return new Promise(function(resolve, reject) {
		// Do the usual XHR stuff
		var req = new XMLHttpRequest();
		req.open('GET', url);

		req.onload = function() {

			if (req.status == 200) {
				resolve(req.response);
			}
			else {
				reject(Error(req.statusText));
			}
		};

		req.onerror = function() {
			reject(Error("Network Error"));
		};

		req.send();
	});
	

}





















class UpdatedApp extends React.Component {

	// default state

	/*
		{
			allCollectionInfo: null,  Holds colloquial name and num keys (see fetchAllCollectionInfo() for format)
			clickedCollectionId: null,
			clickedCollectionNumKeys: null,
			clickedCollectionNumKeyBits: null,
			
			selectedDataKeyId : null,
			selectedDataIsKey: null,
			selectedDataBitId: null,

			selectedCtextData : null
		
		}



	*/

	


	// called when app first loaded and when refresh needed (either user update or manually selects refresh)
	fetchAllCollectionInfo(){
		/* loads 
		{
			collectionId_1: {
				numKeys:3,
				colloquial_name: "my collection"
			},
		}
		*/
		collectionPromise = fetch('collection_info');
		collectionPromise.then(function(collectionData){
			this.setState({allCollectionInfo: collectionData});
		}).catch(function(err){

		});
	}


	isCtextDataCached(collectionId, keyId, bitId = null){
		if( !(collectionId in collectionDataCache) || !(keyId in collectionDataCache[collectionId])){
			return false;
		}
		if(bitId == null && !('keyCtext' in collectionDataCache[collectionId][keyId])){
			return false;
		}
		else if(!('valueCtext' in collectionDataCache[collectionId][keyId]) || !(bitId in collectionDataCache[collectionId][keyId]['valueCtext'])) {
			return false;
		}
		return true;
	}

	cacheCtextData(collectionId, keyId, ctextData, bitId = null){
		if(!(collectionId in collectionDataCache)){
			collectionDataCache[collectionId] = {};
		}
		if(!(keyId in collectionDataCache[collectionId])){
			collectionDataCache[collectionId][keyId] = {};
		}
		if(bitId != null){ // is a key
			if(!('keyCtext' in collectionDataCache[collectionId][keyId])){
				collectionDataCache[collectionId][keyId]['keyCtext'] = {};
			}
			collectionDataCache[collectionId][keyId]['keyCtext'][bitId] = ctextData;
		}
		else{ // is a value
			collectionDataCache[collectionId][keyId]['valueCtext'] = ctextData;
		}
	}




	isCollectionClicked(collectionId){
		if(!this.state.clickedCollectionId != collectionId){
			return false;
		}
		return true;
	}

	// Callback for when a collection is clicked in the CollectionViewer
	// KevValueSelector will render using the collectionId and allCollectionInfo.numKeys/numKeyBits
	collectionClicked(collectionId){
		if(isCollectionClicked(collectionId)){
			// this collection is already clicked, do nothing
			return false;
		}
		this.setState({

			clickedCollectionId: collectionId,

			clickedCollectionNumKeys: allCollectionInfo[clickedCollectionId].numKeys,
			clickedCollectionNumKeyBits: allCollectionInfo[clickedCollectionId].numKeyBits,
			
			selectedDataKeyId : null,
			selectedDataIsKey: null,
			selectedDataBitId: null,

			selectedCtextData : null
		
		});
		return true;
	}



	// checks wethere the key bit (bitId != null) or value is selected already
	isCollectionDataClicked(collectionId, keyId, bitId = null){

		if(	this.state.clickedCollectionId != collectionId 	|| this.state.selectedDataKeyId != keyId){
			return false;
		}
		// is key data
		if(bitId != null && (!this.state.selectedDataIsKey || this.state.selectedDataBitId != bitId) ){
			return false;
		}
		else if(bitId == null && this.state.selectedDataIsKey){
			return false;
		}
		return true;
	}


	// called when the ctextData is loaded for the selected data in KevValueViewer
	setSelectedDataState(collectionId, keyId, bitId = null){

		newState = {
			clickedCollectionId: collectionId,
			clickedCollectionNumKeys: allCollectionInfo[clickedCollectionId].numKeys,
			clickedCollectionNumKeyBits: allCollectionInfo[clickedCollectionId].numKeyBits,

			selectedDataKeyId : keyId,
		};

		// is a value
		if(bitId == null){
			newState.selectedDataIsKey = false;
			newState.selectedDataBitId = null;
			newState.selectedCtextData = collectionDataCache[collectionId][keyId]['valueCtext'];
		}
		else{
			// is a key
			newState.selectedDataIsKey = true;
			newState.selectedDataBitId = bitId;
			newState.selectedCtextData = collectionDataCache[collectionId][keyId]['keyCtext'][bitId];
		}
		this.setState(newState);
	}

	// callback when a data selector is clicked in the KeyValueSelector
	// propagate the state to the KeyValueSelector which will use the selectedCollectionId and allCollectionInfo state
	collectionDataClicked(collectionId, keyId, bitId = null){
		
		if(isCollectionDataClicked(collectionId, keyId, bitId)){ // this 
			return false;
		}
		// check if the ctext data was already loaded otherwise fetch the ctext data
		if(!isCtextDataCached(collectionId, keyId, bitId)) {

			dataType = (bitId == null)? 'value_ctext' : 'key_bit_ctext';
			ctextDataPromise = fetch(dataType, collectionId, keyId, bitId);

			ctextDataPromise.then(function(ctextData){
				cacheCtextData(collectionId, keyId, keyBitData, bitId);
				setSelectedDataState(collectionId, keyId, bitId);
			}).catch(function(err){

			});
		}
		else{
			setSelectedDataState(collectionId, keyId, bitId);
		}		
	}


	constructor(props){
		super(props);

		// acts as a data cache
		// the currently selected data will also be set in the state variable
		//
		// collectionDataCache = {
		// 	collectionId: {   if collectionId not in collectionDataCache then it has not yet been loaded
		//	'keyCtext': {
		//		keyId: {
		//			bitId: citCtext,
		//		},
		//	},
		//	'valueCtext': {
		//		keyId: ctext,
		//	},
		// }
		// stores all loaded collections and any loaded polynomial data, avoid re-fetching from server
		this.collectionDataCache = {};

		this.state = {

			
			allCollectionInfo: null,  // Holds colloquial name and num keys (see fetchAllCollectionInfo() for format)

			clickedCollectionId: null,
			clickedCollectionNumKeys: null,
			clickedCollectionNumKeyBits: null,
			
			selectedDataKeyId : null,
			selectedDataIsKey: null,
			selectedDataBitId: null,

			selectedCtextData : null
		
		
		};

		fetchAllCollectionInfo();
	}


	render(){
		
		return (<table><tr>
				<td>
					<CollectionViewer 
					collectionClicked={this.collectionClicked} 
					allCollectionInfo={this.state.allCollectionInfo} 
					clickedCollectionId={this.state.clickedCollectionId} />
				</td>
				<td>
					<table><tr>
						<td>
							<KeyValueSelector 
							collectionDataClicked={this.collectionDataClicked}
							clickedCollectionId={this.state.clickedCollectionId} 
							clickedCollectionNumKeys={this.state.clickedCollectionNumKeys}
							clickedCollectionNumKeyBits={this.state.clickedCollectionNumKeyBits} />
						</td>
						<td>
							<DataViewer 
							isSelected = {this.state.selectedDataKeyId} 
							selectedCtextData={this.state.selectedCtextData} />
						</td>
					</tr></table>
				</td>
			</tr></table>
		);
	}
}




class CollectionViewer extends React.Component {


	handleClick(e){
		this.collectionClicked(e.collectionId);
	}


	constructor(props){
		this.collectionsInfo = props.collectionsInfo;
		this.collectionClicked = props.collectionClicked;
	}

	render(){
		return(
			<table>
				{this.collectionsInfo.map(function(singleCollectionInfo){
					return( 
						<tr><td>
							<div collectionId={singleCollectionInfo.key} onClick={this.collectionClicked}>
								Collection: {singleCollectionInfo.value.colloquialName}
							</div>
						</td></tr>
					);
				})}
			</table>
		);
	}
}


class KeyValueSelector extends React.Component {

	handleClick(e){
		if(e.isKey == true){
			this.collectionDataClicked(e.collectionId, e.keyId, e.bitId);
		}
		else{
			this.collectionDataClicked(e.collectionId, e.keyId);
		}
	}

	

	

	constructor(props){
		
		// these are the callback functions for when a selector is clicked
		this.collectionDataClicked = props.collectionDataClicked;

		this.state.collectionId = props.clickedCollectionId;

		this.state.numKeys = props.clickedCollectionNumKeys;
		this.state.numBits = props.clickedCollectionNumKeyBits;
		
	}



	createSingleKeyBitCell(collectionId, keyId, bitId){
		return(
			<td>
				<div isKey=true collectionId={collectionId} keyId={keyId} bitId={bitId} onClick={this.handleClick}>
					Bit: {bitId}
				</div>
			</td>
		);
	}

	createAllKeyBitCells(collectionId, keyId, numBits){
		var cells = [];
		for (var i = 0; i < numBits; i++) {
			cells.push(createSingleKeyBitCell(collectionId, keyId, i));
		}
		return(<table><tr>{cells}</tr></table>);
	}

	createKeyAndValueSelectorRow(collectionId, keyId, numBits){
		
		return(
			<tr><td>
				<table><tr>
					<td>
						<div isKey=false collectionId={collectionId} keyId={keyId} onClick={this.handleClick}>
							Value of Key: {keyId}
						</div>
					</td>
					<td>
						{ createAllKeyBitCells(collectionId, keyId, numBits) }
					</td>
				</tr></table>
			</td></tr>
		);
	}


	generateAllSelectorRows(numKeys, collectionId, numBits){
		allKeyAndValueRows = [];
		for (var i = 0; i < this.state.numKeys; i++) {
			allKeyAndValueRows.push(createKeyAndValueSelectorRow(collectionId, i, numBits));
		}
		return allKeyAndValueRows;
	}

	render(){

		if(this.state.collectionClicked==false){
			return(<div>Please select a collection first.</div>);
		}
		else{
			allKeyAndValueRows = generateAllSelectorRows(this.state.numKeys, this.state.collectionId, this.state.numBits);
			return(<table>{allKeyAndValueRows}</table>);
		}
	}
}




class DataViewer extends React.Component {

	constructor(props){
		this.state.isSelected = props.selectedDataKeyId;
		this.state.selectedCtextData = props.selectedCtextData;
	}

	// param arrayOfPolynomials is multi dimensional array
	// first level is array of polyArray
	// generates a table row with each polynomail
	// <tr> <td> 1111 | 1112 | 1113 </td> <td> 2221 | 2222 | 2223 </td> </tr>
	buildPolyTableRow(arrayOfPolynomials){
		return(<tr> {arrayOfPolynomials.map(buildPolyTableCell)} </tr>);
	}

	// param polyArray is array of ints representing all coefficients of a single polynomial
	// generates a table cell <td> 1234 | 1341 | 3521 </td> 
	buildPolyTableCell(polyArray){
		return(<td> {polyArray.join(" | ")} </td>);
	}

	render(){
		if(!this.state.isSelected){
			return(<div>Select either key or value to load and view data</div>);
		}
		else if(this.state.selectedCtextData == null){
			return(<div>Loading data...</div>);
		}
		else{
			/* 
				the selectedData is a lattice as multi dimensional array.
				[
					[[---],[---]],
					[[---],[---]],
					[[---],[---]]
				]

				Display as: 
					-|-|-   -|-|-
					-|-|-	-|-|-
					-|-|-	-|-|- 

				<table>
					<tr>
						<td>Element 1,1,1 | Element 1,1,2 | Element 1,1,3</td><td>Element 1,2,1 | Element 1,2,2 | Element 1,2,3</td>
					</tr>
					<tr>
						<td>Element 2,1,1 | Element 2,1,2 | Element 2,1,3</td><td>Element 2,2,1 | Element 2,2,2 | Element 2,2,3</td>
					</tr>
					<tr>
						<td>Element 3,1,1 | Element 3,1,2 | Element 3,1,3</td><td>Element 3,2,1 | Element 3,2,2 | Element 3,2,3</td>
					</tr>
				</table>
			*/

			return(
				<table>{this.state.selectedData.map(buildPolyTableRow)}</table>
			);
		}
	}

}