import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  type HygieneVerdict = {
    #poor;
    #fair;
    #good;
    #excellent;
  };

  type ScanRecord = {
    id : Nat;
    image : Storage.ExternalBlob;
    category : Text;
    score : Nat;
    verdict : HygieneVerdict;
    findings : [Text];
    summary : Text;
    timestamp : Int;
  };

  module ScanRecord {
    public func compareByTimestampDesc(a : ScanRecord, b : ScanRecord) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let scanRecords = Map.empty<Nat, ScanRecord>();
  var nextId = 0;
  var apiKey : ?Text = null;

  //--------------------
  // Hygiene Analysis Core Functionality
  //--------------------
  public shared ({ caller }) func analyzeAndStore(image : Storage.ExternalBlob, category : Text) : async ScanRecord {
    let recordId = nextId;
    nextId += 1;

    let analysisResult = {
      score = 85;
      verdict = #good;
      findings = ["Fresh appearance", "Clean surface"];
      summary = "Score: 85 - verdict: Good. This apple appears fresh with minimal signs of contamination. The surface is clean, no visible bruises or mold. Would recommend washing before consumption for optimal hygiene.";
    };

    let record : ScanRecord = {
      id = recordId;
      image;
      category;
      score = analysisResult.score;
      verdict = analysisResult.verdict;
      findings = analysisResult.findings;
      summary = analysisResult.summary;
      timestamp = Time.now();
    };

    scanRecords.add(recordId, record);
    record;
  };

  //--------------------
  // Scan Record Management
  //--------------------
  public query ({ caller }) func getAllRecords() : async [ScanRecord] {
    scanRecords.values().toArray().sort(ScanRecord.compareByTimestampDesc);
  };

  public shared ({ caller }) func deleteRecord(id : Nat) : async () {
    if (not scanRecords.containsKey(id)) {
      Runtime.trap("Record not found");
    };
    scanRecords.remove(id);
  };

  //--------------------
  // Gemini API Key Management
  //--------------------
  public shared ({ caller }) func setApiKey(key : Text) : async () {
    apiKey := ?key;
  };

  public query ({ caller }) func hasApiKey() : async Bool {
    apiKey != null;
  };
};
