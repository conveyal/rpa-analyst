package controllers;

import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;

import play.*;
import play.libs.Json;
import play.mvc.*;
import views.html.*;

public class Application extends Controller {

    
    public static Result rpa_jobs() {
        return ok(rpa_jobs.render());//);
    }
    
    public static Result rpa_workforce() {
        return ok(rpa_workforce.render());//);
    }
    
  
    public static Result options(String file) {
    	response().setHeader("ACCESS_CONTROL_ALLOW_METHODS", "GET, POST, PUT, PATCH");
    	response().setHeader("ACCESS_CONTROL_ALLOW_HEADERS", "Content-Type" );
    	response().setHeader("ACCESS_CONTROL_ALLOW_ORIGIN", "*");
    	return ok();
    
    }

}
