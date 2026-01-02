import { Button } from "@anchore/ui/components/button";

function Wallet(props) {
  if (!props.publicKey) {
    return (
      <Button
        onClick={() => {
          requestConnection(props);
        }}
      >
        Connect Wallet
      </Button>
    );
  } else {
    <Button
      onClick={() => {
        disconnect();
      }}
    >
      Disconnect Wallet
    </Button>;
  }
}

function requestConnection(props) {
  props.provider.requestConnection().then((connected) => {
    console.log("Connected?", connected);
    if (!connected) {
      getActivePublicKey(props);
    }
  });
}

function disconnect(props) {
  props.provider.requestConnection().then((connected) => {
    console.log("Connected?", connected);
    if (!connected) {
      getActivePublicKey(props);
    }
  });
}

function getActivePublicKey(props) {
  props.provider
    .getActivePublicKey()
    .then((publickey) => {
      props.setPublicKey(publickey);
    })
    .catch((errror) => {
      if (error == 1) {
        console.log("wallet locked");
      } else if (error == 2) {
        console.error("not approved");
      }
    });
}

export default Wallet;
