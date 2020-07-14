import React, {Component} from 'react';
import {View, Text, Button, TextInput} from 'react-native';
import { Crypt, RSA } from 'hybrid-crypto-js';
import io from 'socket.io-client';

var crypt = new Crypt({ md: "sha256" });
var rsa = new RSA({ keySize: 1024 });

class App extends Component{

  componentDidMount(){
    //Listeners
    this.socket = io("http://192.168.1.8:3000");
  }

  constructor(props){
    super(props);
    this.state = {
      msg:'',
    }
  }

  encr(){
    console.log("Detected!!")
    var serverKey;

    rsa.generateKeyPairAsync().then(keys => {

      var signature = crypt.signature(keys.privateKey, this.state.msg);
      // console.log("signature: ", signature);

      //Getting the Server Public Key
      this.socket.emit("ReqServerKey");
      this.socket.on("ServerPublic",key => {
        serverKey=key;
        // console.log(key);
        // console.log("-------------");
        var encrypted = crypt.encrypt(serverKey, this.state.msg, signature);
        console.log("encrypted: ", encrypted);
        // this.setState({encrypted:encrypted});
  
        this.socket.emit("Transaction",encrypted);
      })
    })
    .catch(error => {
      console.log(error);
    });
  }

  render(){
    return(
      <View>
        <TextInput placeholder='Dummy' onChangeText={(text)=>{this.setState({msg:text})}}/>
        <Button title='Encrypt' onPress={()=>this.encr()}/>
          {/* <Text>{this.state.encrypted}</Text> */}
      </View>
    );
  }
}

export default App;