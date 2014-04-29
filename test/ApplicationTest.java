import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import com.fasterxml.jackson.databind.JsonNode;
import com.vividsolutions.jts.geom.Geometry;

import model.AnalystRequest;
import model.SptResponse;

import org.junit.*;
import org.opentripplanner.common.model.GenericLocation;
import org.opentripplanner.routing.core.RoutingRequest;
import org.opentripplanner.routing.spt.ShortestPathTree;

import otp.Analyst;
import play.Logger;
import play.mvc.*;
import play.test.*;
import play.data.DynamicForm;
import play.data.validation.ValidationError;
import play.data.validation.Constraints.RequiredValidator;
import play.i18n.Lang;
import play.libs.F;
import play.libs.F.*;
import static play.test.Helpers.*;
import static org.fest.assertions.Assertions.*;


/**
*
* Simple (JUnit) tests that can call all parts of a play app.
* If you are interested in mocking a whole application, see the wiki for more details.
*
*/
public class ApplicationTest {
	
	Analyst analyst = new Analyst();
	
    @Test
    public void testGraph() {
    	assertThat(analyst.testGraph());
    }
    
    @Test
    public void testSpt() {
    	assertThat(analyst.testSpt());
    }
    
    @Test
    public void testRequest() {

    	AnalystRequest req = analyst.buildRequest(null, "TRANSIT");
    	SptResponse sptResponse = analyst.getSpt(req, null);
    	
    	assertThat(sptResponse);	 	
    }
    
    
    @Test
    public void testIsoline() {

    	AnalystRequest req = analyst.buildRequest(null, "TRANSIT");
    	SptResponse sptResponse = analyst.getSpt(req, null);
    	
    	Geometry geom = sptResponse.getIsoline(500);
    	
    	assertThat(geom);	 	
    }
}
