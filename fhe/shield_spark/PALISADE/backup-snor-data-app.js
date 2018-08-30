
































































class App extends React.Component {

	// default state
	//	{
	//		allCollectionInfo: null,  Holds colloquial name and num keys (see fetchAllCollectionInfo() for format)
	// 		collectionClicked: false,
	// 		collectionId : null,
	//		dataSelected : false,
	// 		isKey: null,
	// 		keyId: null,
	// 		bitId: null,
	// 		ctextData : null
	// 	
	//	}
	/*
		{
			allCollectionInfo: null,  Holds colloquial name and num keys (see fetchAllCollectionInfo() for format)
			clickedCollectionId: null,
			clickedCollectionName: null,
			clickedCollectionNumKeys: null,
			clickedCollectionNumKeyBits: null,
			
			selectedDataKeyId : null,
			selectedDataIsKey: null,
			selectedDataBitId: null,

			selectedCtextData : null
		
		}



	*/

	// acts as a data cache
	// the currently selected data will also be set in the state variable
	//
	// allCollectionData = {
	// 	collectionId: {   if collectionId not in allCollectionData then it has not yet been loaded
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
	let allCollectionData = {};


	// called when app first loaded and when refresh needed (either user update or manually selects refresh)
	function fetchAllCollectionInfo(){
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


	function setKeyBitCtextData(collectionId, keyId, bitId, keyBitCtextData){
		if(!(collectionId in allCollectionData)){
			allCollectionData[collectionId] = {};
		}
		if(!('keyCtext' in allCollectionData[collectionId])){
			allCollectionData[collectionId]['keyCtext'] = {};
		}
		if(!(keyId in allCollectionData[collectionId]['keyCtext'])){
			allCollectionData[collectionId]['keyCtext'][keyId] = {};
		}
		allCollectionData[collectionId]['keyCtext'][keyId][bitId] = keyBitCtextData;
	}


	function setValueCtextData(collectionId, keyId, valueCtext){
		if(!(collectionId in allCollectionData)){
			allCollectionData[collectionId] = {};
		}
		if(!('valueCtext' in allCollectionData[collectionId])){
			allCollectionData[collectionId]['valueCtext'] = {};
		}
		allCollectionData[collectionId]['valueCtext'][keyId] = valueCtext;
	}

	function checkCollectionClicked(collectionId){
		// check if the right collection was already clicked
		if(this.state == null || this.state.collectionId != collectionId){
			// the wrong collection was clicked, need to have selected the right collection first
			return false;
		}
	}

	// click a collection to render the key/value viewer using pre loaded num keys
	function collectionClicked(collectionId){
		if(checkCollectionClicked(collectionId)){
			// this collection is already clicked
			return false;
		}
		this.setState({
			collectionClicked: true,
			collectionId : collectionId,
			dataSelected : false,
			isKey: null,
			keyId: null,
			bitId: null,
			ctextData : null
		});
		return true;
	}

	function checkKeyBitIsClicked(collectionId, keyId, bitId){
		if( !this.state.collectionClicked 			||
			this.state.collectionId != collectionId ||
			!this.state.dataSelected 	|| 
			!this.state.isKey 			|| 
			this.state.keyId != keyId 	||
			this.state.bitId != bitId
			)
		{
			// the bit for this key was already selected
			return false;
		}
		return true;
	}


	function checkKeyBitDataLoaded(collectionId, keyId, bitId) {
		if( !(collectionId in allCollectionData) || 
			!('keyCtext' in allCollectionData[collectionId]) || 
			!(keyId in allCollectionData[collectionId]['keyCtext']) ||
			!(bitId in allCollectionData[collectionId]['keyCtext'][keyId]))
		{
			return false;
		}
		return true;
	}



	function setCollectionKeyBitDataState(collectionId, keyId, bitId){
		this.setState({
			collectionClicked: true,
			collectionId : collectionId,
			dataSelected : true,
			isKey: true,
			keyId: keyId,
			bitId: bitId,
			ctextData : allCollectionData[collectionId]['keyCtext'][keyId][bitId]
		});
	}

	function setCollectionValueDataState(collectionId, keyId){
		this.setState({
			collectionClicked: true,
			collectionId : collectionId,
			dataSelected : true,
			isKey: false,
			keyId: keyId,
			bitId: null,
			ctextData: allCollectionData[collectionId]['valueCtext'][keyId]
		});
	}

	function collectionKeyBitClicked(collectionId, keyId, bitId){

		// collection was not selected or the key bit is already selected
		if(!checkCollectionClicked(collectionId) || checkKeyBitIsClicked(collectionId, keyId, bitId)){
			return false;
		}

		// check if the data was already loaded for this key bit, otherwise fetch the ctext data
		if(!checkKeyBitDataLoaded(collectionId, keyId, bitId)) {

			keyBitPromise = fetch('key_bit_ctext', collectionId, keyId, bitId);
			keyBitPromise.then(function(keyBitData){
				// set state to propogate the change to inner elements
				setKeyBitCtextData(collectionId, keyId, bitId, keyBitData);
				setCollectionKeyBitDataState(collectionId, keyId, bitId);
			}).catch(function(err){

			});
		}
		else{
			// data already loaded, update state
			setCollectionKeyBitDataState(collectionId, keyId, bitId);
		}		
	}


	function checkValueIsClicked(collectionId, keyId){
		if(!this.state.dataSelected 					||
			this.state.isKey 							|| 
			this.state.collectionId != collectionId 	||
			this.state.keyId != keyId)
		{
			return false;
		}
		return true;
	}

	function checkValueDataLoaded(collectionId, keyId) {
		if( !(collectionId in allCollectionData) || 
			!('valueCtext' in allCollectionData[collectionId]) || 
			!(keyId in allCollectionData[collectionId]['valueCtext'])
		{
			return false;
		}
		return true;
	}


	

	function collectionValueClicked(collectionId, keyId){

		// collection was not selected or the value is already selected
		if(!checkCollectionClicked(collectionId) || checkValueIsClicked(collectionId, keyId)){
			return false;
		}

		// is data not loaded then fetch the ctext data with a promise, then set state
		if(!checkValueDataLoaded(collectionId, keyId)){
			valuePromise = fetch('value_ctext', collectionId, keyId);
			valuePromise.then(function(valueData){
				// set state to propogate the change to inner elements
				setValueCtextData(collectionId, keyId, valueData);
				setCollectionValueDataState(collectionId, keyId);
			}).catch(function(err){

			});
		}
		else{
			// data already loaded, set state
			setCollectionValueDataState(collectionId, keyId);
		}
	}

	function constructor(props){
		super(props);
		this.state = {

			allCollectionInfo: null,
			collectionClicked: false,
			numKeys: null,
			collectionId : null,
			dataSelected : false,
			isKey: null,
			keyId: null,
			bitId: null,
			ctextData : null
		};

		fetchAllCollectionInfo();
	}


	function render(){
		
		return (
			<table><tr>
				<td>
					<CollectionViewer 
					collectionClicked={this.collectionClicked} 
					collectionInfo={this.state.collectionsInfo} />
				</td>
				<td>
					<table><tr>
						<td>
							<KeyValueSelector 
							collectionKeyBitClicked={this.collectionKeyBitClicked} 
							collectionValueClicked={this.collectionValueClicked} 
							collectionClicked={this.state.collectionClicked} 
							numKeys={this.state.numKeys} 
							numBits=32 />
						</td>
						<td>
							<DataViewer 
							isSelected={this.state.dataSelected} 
							selectedData={this.state.selectedData} />
						</td>
					</tr></table>
				</td>
			</tr></table>
		);
	}
}


class CollectionViewer extends React.Component {

	function constructor(props){
		this.collectionsInfo = props.collectionsInfo;
		this.collectionClicked = props.collectionClicked;
	}

	function render(){
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

	function handleClick(e){
		if(this.state.isKey == true){
			this.collectionKeyBitClicked(this.state.collectionId, this.state.keyId, this.state.bitId);
		}
		else{
			this.collectionValueClicked(this.state.collectionId, this.state.keyId);
		}
	}

	

	function generateAllSelectorRows(numKeys, collectionId, numBits){
		allKeyAndValueRows = [];
		for (var i = 0; i < this.state.numKeys; i++) {
			allKeyAndValueRows.push(createKeyAndValueSelectorRow(collectionId, i, numBits));
		}
		return allKeyAndValueRows;
	}

	function constructor(props){
		
		// these are the callback functions for when a selector is clicked
		this.collectionKeyBitClicked = props.collectionKeyBitClicked;
		this.collectionValueClicked = props.collectionValueClicked;

		this.state.collectionId = props.collectionId;
		this.state.keyId = props.keyId;
		this.state.bitId = props.bitId;

		
		this.state.collectionClicked = props.collectionClicked;
		this.state.numKeys = props.numKeys;
		this.state.numBits = 32;

	}



	function createSingleKeyBitCell(collectionId, keyId, bitId){
		return(
			<td>
				<div isKey=true collectionId={collectionId} keyId={keyId} bitId={bitId} onClick={this.handleClick}>
					Bit: {bitId}
				</div>
			</td>
		);
	}

	function createAllKeyBitCells(collectionId, keyId, numBits){
		var cells = [];
		for (var i = 0; i < numBits; i++) {
			cells.push(createSingleKeyBitCell(collectionId, keyId, i));
		}
		return(<table><tr>{cells}</tr></table>);
	}

	function createKeyAndValueSelectorRow(collectionId, keyId, numBits){
		
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



	function render(){

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

	function constructor(props){
		this.state.isSelected = props.isSelected;
		this.state.selectedData = props.selectedData;
	}

	// param arrayOfPolynomials is multi dimensional array
	// first level is array of polyArray
	// generates a table row with each polynomail
	// <tr> <td> 1111 | 1112 | 1113 </td> <td> 2221 | 2222 | 2223 </td> </tr>
	function buildPolyTableRow(arrayOfPolynomials){
		return(<tr> {arrayOfPolynomials.map(buildPolyTableCell)} </tr>);
	}

	// param polyArray is array of ints representing all coefficients of a single polynomial
	// generates a table cell <td> 1234 | 1341 | 3521 </td> 
	function buildPolyTableCell(polyArray){
		return(<td> {polyArray.join(" | ")} </td>);
	}

	function render(){
		if(isSelected == false){
			return(<div>Select either key or value to load and view data</div>);
		}
		else if(this.state.selectedData == null){
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














































class App extends React.Component {


	// allCollectionData = {
	// 	collectionId: {   if collectionId not in allCollectionData then it has not yet been loaded
	//	'numKeys': (int),
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
	let allCollectionData = {};

	constructor(props) {
		super(props);
		this.state = {

			// selectedInfo : {
			// 	collectionId : 1,
			// 	dataSelected : true,
			// 	isKey: true,
			// 	keyBit: 1
			// }
			selectedInfo: null, 
		};
	}


	collectionClicked(collectionId){
		if(this.state.selectedInfo == null || this.state.selectedInfo.collectionId != collectionId){
			if(!(collectionId in this.allCollectionData)){
				// the collection's key ids have not yet been loaded from the server
				// set the keys as null so the data viewer has a loading bar
				// use a promiss to load the data then set the num keys
				collectionKeysPromiss = fetch('collection_keys', collectionId);
				
					
				collectionKeysPromiss.success(
					function(){

						this.allCollectionData[collectionId] = {
							'numKeys': collectionKeysPromiss.numKeys,
							'keyCtext' : {},
							'valueCtext': {}
						};

						// sets the selected collectionId and numKeys
						this.setState(
							{
								selectedInfo : {
									collectionId : collectionId,
									numKeys:  this.allCollectionData[collectionId].numKeys, 
									dataSelected: false // clicking the collection brings to top level, no data selected yet
									isKey: null,
									keyId: null,
									keyBit: null,
									polyData: null,
								}
							}
						);
					} 
				);
				
				this.setState(
					{
						// sets the selected collectionId
						selectedInfo : {
							collectionId : collectionId,
							numKeys: null, 
							dataSelected: false // clicking the collection brings to top level, no data selected yet
							isKey: null,
							keyId: null,
							keyBit: null,
							polyData: null,
						}
					}
				);
			}
			else{
				// there was already data loaded from the server so use that for num keys in set state
				this.setState(
					{
						// sets the selected collectionId and numKeys
						selectedInfo : {
							collectionId : collectionId,
							numKeys: this.allCollectionData[collectionId].numKeys, 
							dataSelected: false // clicking the collection brings to top level, no data selected yet so is false
							isKey: null,
							keyId: null,
							keyBit: null,
							polyData: null,
						}
					}
				);
			}
		}
	}

	// could break into key bit selected vs value selected
	dataClicked(collectionId, isKey, keyId, keyBit){
		if(this.state.selectedInfo == null){
			// ERROR : need a collection selected first
		}
		if(this.state.selectedInfo.collectionId != collectionId){
			// ERROR : need to have selected the same collection
		}
		if(this.state.selectedInfo.dataSelected == true && this.state.selectedInfo.isKey == isKey && this.state.selectedInfo.keyId == keyId && this.state.selectedInfo.keyBit == keyBit){
			// ERROR: same one already selected
		}

		if(!(collectionId in this.allCollectionData)){
			// another error because a promiss might not have finished to get the num keys
		}

		if(isKey == true){
			if(!(keyId in this.allCollectionData.keyCtext)){
				this.allCollectionData.keyCtext[keyId] = {};
			}
			if(!(keyBit in this.allCollectionData.keyCtext[keyId])){
				keyDataPromiss = fetch('key_data', collectionId, keyId);
			}
		}
		else{

		}
		this.setState(
			{
				selectedInfo : {
					collectionId : collectionId, 
					dataSelected: true // clicking the collection brings to top level, no data selected yet
					isKey: isKey,
					keyId: keyId,
					keyBit: keyBit,
					polyData: null, // while loading data from server the poly data is null so a loading bar is used
				}
			}
		);
	}

	render(){
		
		return (
			<table>
				<tr>
					<td>
						<CollectionViewer collectionClicked={this.collectionClicked}/>
					</td>
					<td>
						<DataViewer dataClicked={this.dataClicked}/>
					</td>
				</tr>
		);
	}
}

















class DataViewer extends React.Component {
	
	// allCollectionData = {
	// 	collectionId: {
	//	'keyIds': [, (int)],
	//	'keyCtext': {
	//		keyId: [,bitwise ctext],
	//	},
	//	'valueCtext': {
	//		keyId: ctext,
	//	},
	// }
	// stores all loaded collections and any loaded polynomial data, avoid re-fetching from server
	let allCollectionData = {};


	function selectCollection(collectionId){
		if(this.state.selectedCollectionInfo != null && this.state.selectedCollectionInfo.collectionId == collectionId){
			// nothing to do, same one clicked
			return;
		}

		this.state.selectedPolyInfo = null;
		
		if(!(collectionId in this.allCollectionData)){
			collectionKeys = fetchCollectionKeys(collectionId);
			this.allCollectionData[collectionId] = {
				keyIds: collectionKeys,
				keyCtext: null,
				valueCtext: null
			};
		}
		this.state.selectedCollectionInfo = {
			collectionId : collectionId, 
			collectionKeys: this.allCollectionData[collectionId].keyIds
		};
	}


	function selectPoly(isKey, keyId, bitId){
		if(this.state.selectedPolyInfo != null){ // already a poly selected
			if(this.state.selectedPolyInfo.isKey == isKey && this.state.selectedPolyInfo.keyId == keyId && this.state.selectedPolyInfo.bitId == bitId){
				// nothing to do, this one already selected
				return;
			}
		}

		collectionId = this.state.selectedCollectionInfo.collectionId;

		if(isKey == true){
			if(this.allCollectionData[collectionId].keyCtext == null){
				this.allCollectionData[collectionId].keyCtext = {};
			}
		}

		

		this.state.selectedPolyInfo = {
			isKey: isKey,
			keyId: keyId,
			bitId: bitId
		}

		return;
	}


	function fetchCollectionKeys(collectionId){
		dataKeys = fetch('keys', uid, cc_id, key_id);
	}



	let keysByCollectionId = {};

	function setSelectedDataCollection(collectionId){


		if(this.state.selectedCollectionInfo != null && this.state.selectedCollectionInfo.collectionId == collectionId){
			// nothing to do, same one clicked
			return;
		}
		this.state.selectedPolyInfo = null;
		
		if(!(collectionId in this.keysByCollectionId)){
			collectionKeys = fetchCollectionKeys(collectionId);
			keysByCollectionId[collectionId] = collectionKeys;
		}
		this.state.selectedCollectionInfo = {
			collectionId : collectionId, 
			collectionKeys: keysByCollectionId[collectionId]
		};
	}

	
	function setSelectedPoly(isKey, keyId, bitId){
		if(this.state.selectedPolyInfo != null){ // already a poly selected
			if(this.state.selectedPolyInfo.isKey == isKey && this.state.selectedPolyInfo.keyId == keyId && this.state.selectedPolyInfo.bitId == bitId){
				// nothing to do, this one already selected
				return;
			}
		}

		this.state.selectedPolyInfo = {
			isKey: isKey,
			keyId: keyId,
			bitId: bitId
		}

		return;
	}



	constructor(props){
		super(props);
		this.uid = props.uid;
		this.state = {
			selectedCollectionInfo: null, // null when not selected, {collectionId: (int), collectionKeys: [,int]}
			selectedPolyInfo: null // null when not selected, else is {isKey: [true/false], keyId: (int), bitId: [int or not in]}
		}
	}

	render(){

		if(this.state.selectedCollectionInfo == null){
			return(
				<div>Select a collection to view the encrypted data.</div>
			);
		}

		return (
			<div>
				<table>
					{this.state.selectedCollectionInfo.collectionKeys.map(function(keyId){
						return (
							<tr>
								Key: {keyId}
								<td>
									<KeyViewer numBits=32 keyId={keyId} setSelectedPoly={this.setSelectedPoly}/>
								</td>
								<td>
									<ValueViewer keyId={keyId} setSelectedPoly={this.setSelectedPoly}/>
								</td>
							</tr>

						);
					})}
				</table>
			</div> 
			<div>
				<PolyViewer collectionInfo={this.state.selectedCollectionInfo} polyInfo={this.state.selectedPolyInfo}/>
			</div>
			);

	}
}



class KeyViewer extends React.Component {
	const numBits = 32;
	const keyId = 1;

	function bitClicked(bitId){
		this.setSelectedPoly(true, keyId, bitId);
	}



	function createKeyBitsTable(){
		let columns = [];
		for (let bitId = 0; bitId < numBits; bitId++) {
			columns.push(
				<td>
					<button data-type="key" key-id={keyId} bit-id={bitId} onClick={this.bitClicked}>
						Bit {bitId+1}
					</button>
				</td>
				);
		}

		return <table><tr>{columns}</tr><table>;
	}

	render(){
		if(selectedBitId < 0){
			return(
				<div>
					Key {keyId}
				</div>
				{createKeyBitsTable()}
				<div>
					<PolyViewer values=this.state.values/>
				</div>
			);
		} 
	}
}


class PolyViewer extends React.Component {
	
	let polyData = {};

	constructor(props){
		super(props);
		this.uid = props.uid;
		this.collectionId = props.collection_id;
		this.dataType = props.dataType;
		this.state = {
			keyId: props.keyId,
			bitId: props.bitId,
		};
	}


	function getPolyData(){
		if(polyData != null){
			return true;
		}
		else{
			polyDataRet = fetch('polyData', this.uid, this.collectionId, this.dataType, this.state.keyId, this.state.bitId);
			polyData[this.state.bitId] = JSON.parse(polyDataRet);
		}
	}

	

	render(){

		if(this.state.show == false){
			return();
		}


		// need to fetch data for this poly node
		if(!(this.state.bitId in polyData)) {
			getPolyData();
		}


		return (
			<table>
				<tr>
					{this.polyData.map(function(polyInt){
						return <td>{polyInt}</td>;
					})}
				</tr>
			<table>
		);
	}
}












class PolyViewer extends React.Component {

	const dataType = ['key', 'value'];
	const collectionId;
	const keyId = ;
	const bitId = ;


	hasData = false;

	polyData = [];


	isHidden = false;

	function hidePoly(){
		setState({isHidden: true});
	}

	function showPoly(){
		setState({isHidden: false});
	}

	function getPolyData(){
		if(hasData == true){
			return polyData;
		}
		else{
			polyDataRet = fetch('polyData', uid, collectionId, dataType, keyId, bitId);
			polyData = JSON.parse(polyDataRet);
		}
	}
	render(){

		// do not show anything
		if(isHidden == true){
			return();
		}

		// need to fetch data for this poly node
		if(hasData == false){
			getPolyData();
		}

		return (
			<table>
				<tr>
					{this.polyData.map(function(polyInt){
						return <td>{polyInt}</td>;
					})}
				</tr>
			<table>
		);
	}
}




import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './components/App';


class DataCollections extends React.Component {


	let allCollections = {};

	function getCollectionsFromServer(){

		return {collection_id : {collection_info}, }
	}

	render(){

		allCollections = getCollectionsFromServer();

		return allCollections.map(
				function(collection){
					return <div id={"data_collection_" + collection.key}> collection.value['name'] </div>;
				};
			)
	}
}



class DataViewer extends React.Component {

	let dataKeys = [];

	function getDataKeys(){
		dataKeys = fetch('keys', uid, cc_id, key_id);
	}

	render(){

		if(data_selected){
			getDataKeys();

			return (
				<div>Key a key to see the encrypted data.</div>
				{dataKeys.map(function(key_data){
					return <div id={"data_key_" + key_data.key}>Key: {key_data.key}</div>; // key id
				})}
				
				);

			

		}
		else{
			return (<div> Select a data set or create a new one on the left. </div>);
		}
		
	}
}


class SingleDataViewer extends React.Component {

	// []
	keyBitCtextSamples = [];
	valueCtext = ;

	render(){
		return (
			<table>
				<tr>
					<td>
						<div>Key: {keyBitCtext.map(function(bit_ctext, bit_index){
							return <div>Bit: {bit_index}</div><div>{bit_ctext}</div>;
						})}</div>
					</td>
					<td>
						<div>Value: {valueCtext}</div>
					</td>
				</tr>
			</table>
			);
	}
}

class MainTable extends React.Component {
	render(){
		return <table>
					<tr>
						<td>
							<DataCollections/>
						</td>
						<td>
							<DataViewer/>
						</td>
					</tr>
				</table>;
	}
}

function MainTable(props){
	return <table>
}

render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'));
</script>