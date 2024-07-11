package ut.com.plugin.chatbot;

import org.junit.Test;
import com.plugin.chatbot.api.MyPluginComponent;
import com.plugin.chatbot.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}