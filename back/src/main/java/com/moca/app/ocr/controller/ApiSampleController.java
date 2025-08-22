package com.moca.app.ocr.controller;

import java.io.IOException;

import com.moca.app.ocr.service.ApiSampleService;
import jakarta.servlet.http.*;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;





@Controller
public class ApiSampleController {
	
	@Autowired
	private ApiSampleService sampleService;

	@PostMapping("/ocr")
	@ResponseBody
	public String ocrAPI(HttpServletRequest request, HttpServletResponse response, @RequestBody String reqdata) throws InterruptedException, IOException, ParseException {
		
		String returnData = "";
    	JSONParser parser = new JSONParser();
    	JSONObject jsonObject = (JSONObject) parser.parse(reqdata);
    	
        returnData = sampleService.ocrAPI(jsonObject.get("base64Data").toString(), jsonObject.get("ocrType").toString());
        
		return returnData;
	}
	
}
